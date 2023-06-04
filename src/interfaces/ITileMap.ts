// To parse this data:
//
//   import { Convert, Tmj } from "./file";
//
//   const tmj = Convert.toTmj(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Tmj {
    compressionlevel: number;
    editorsettings:   Editorsettings;
    height:           number;
    infinite:         boolean;
    layers:           Layer[];
    nextlayerid:      number;
    nextobjectid:     number;
    orientation:      string;
    renderorder:      string;
    tiledversion:     string;
    tileheight:       number;
    tilesets:         Tileset[];
    tilewidth:        number;
    type:             string;
    version:          string;
    width:            number;
}

export interface Editorsettings {
    export: Export;
}

export interface Export {
    format: string;
    target: string;
}

export interface Layer {
    data?:     number[];
    height:    number;
    id:        number;
    name:      Name;
    opacity?:  number;
    type:      LayerType;
    visible:   boolean;
    width:     number;
    x:         number;
    y:         number;
    polygon?:  Polygon[];
    rotation?: number;
}

export enum Name {
    Empty = "",
    Layer1 = "layer1",
}

export interface Polygon {
    x: number;
    y: number;
}

export enum LayerType {
    Empty = "",
    Tilelayer = "tilelayer",
}

export interface Tileset {
    columns:     number;
    firstgid:    number;
    image:       string;
    imageheight: number;
    imagewidth:  number;
    margin:      number;
    name:        string;
    spacing:     number;
    tilecount:   number;
    tileheight:  number;
    tiles:       Tile[];
    tilewidth:   number;
}

export interface Tile {
    id:          number;
    objectgroup: Objectgroup;
}

export interface Objectgroup {
    draworder: Draworder;
    name:      string;
    objects:   Layer[];
    opacity:   number;
    type:      ObjectgroupType;
    visible:   boolean;
    x:         number;
    y:         number;
    id?:       number;
}

export enum Draworder {
    Index = "index",
}

export enum ObjectgroupType {
    Objectgroup = "objectgroup",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTmj(json: string): Tmj {
        return cast(JSON.parse(json), r("Tmj"));
    }

    public static tmjToJson(value: Tmj): string {
        return JSON.stringify(uncast(value, r("Tmj")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Tmj": o([
        { json: "compressionlevel", js: "compressionlevel", typ: 0 },
        { json: "height", js: "height", typ: 0 },
        { json: "infinite", js: "infinite", typ: true },
        { json: "layers", js: "layers", typ: a(r("Layer")) },
        { json: "nextlayerid", js: "nextlayerid", typ: 0 },
        { json: "nextobjectid", js: "nextobjectid", typ: 0 },
        { json: "orientation", js: "orientation", typ: "" },
        { json: "renderorder", js: "renderorder", typ: "" },
        { json: "tiledversion", js: "tiledversion", typ: "" },
        { json: "tileheight", js: "tileheight", typ: 0 },
        { json: "tilesets", js: "tilesets", typ: a(r("Tileset")) },
        { json: "tilewidth", js: "tilewidth", typ: 0 },
        { json: "type", js: "type", typ: "" },
        { json: "version", js: "version", typ: "" },
        { json: "width", js: "width", typ: 0 },
    ], false),
    "Editorsettings": o([
        { json: "export", js: "export", typ: r("Export") },
    ], false),
    "Export": o([
        { json: "format", js: "format", typ: "" },
        { json: "target", js: "target", typ: "" },
    ], false),
    "Layer": o([
        { json: "data", js: "data", typ: u(undefined, a(0)) },
        { json: "height", js: "height", typ: 0 },
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: r("Name") },
        { json: "opacity", js: "opacity", typ: u(undefined, 0) },
        { json: "type", js: "type", typ: r("LayerType") },
        { json: "visible", js: "visible", typ: true },
        { json: "width", js: "width", typ: 0 },
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
        { json: "polygon", js: "polygon", typ: u(undefined, a(r("Polygon"))) },
        { json: "rotation", js: "rotation", typ: u(undefined, 0) },
    ], false),
    "Polygon": o([
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
    ], false),
    "Tileset": o([
        { json: "columns", js: "columns", typ: 0 },
        { json: "firstgid", js: "firstgid", typ: 0 },
        { json: "image", js: "image", typ: "" },
        { json: "imageheight", js: "imageheight", typ: 0 },
        { json: "imagewidth", js: "imagewidth", typ: 0 },
        { json: "margin", js: "margin", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "spacing", js: "spacing", typ: 0 },
        { json: "tilecount", js: "tilecount", typ: 0 },
        { json: "tileheight", js: "tileheight", typ: 0 },
        { json: "tiles", js: "tiles", typ: a(r("Tile")) },
        { json: "tilewidth", js: "tilewidth", typ: 0 },
    ], false),
    "Tile": o([
        { json: "id", js: "id", typ: 0 },
        { json: "objectgroup", js: "objectgroup", typ: r("Objectgroup") },
    ], false),
    "Objectgroup": o([
        { json: "draworder", js: "draworder", typ: r("Draworder") },
        { json: "name", js: "name", typ: "" },
        { json: "objects", js: "objects", typ: a(r("Layer")) },
        { json: "opacity", js: "opacity", typ: 0 },
        { json: "type", js: "type", typ: r("ObjectgroupType") },
        { json: "visible", js: "visible", typ: true },
        { json: "x", js: "x", typ: 0 },
        { json: "y", js: "y", typ: 0 },
        { json: "id", js: "id", typ: u(undefined, 0) },
    ], false),
    "Name": [
        "",
        "layer1",
    ],
    "LayerType": [
        "",
        "tilelayer",
    ],
    "Draworder": [
        "index",
    ],
    "ObjectgroupType": [
        "objectgroup",
    ],
};
