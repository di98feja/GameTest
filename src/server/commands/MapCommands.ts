import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"
import MatterJS, { Composite } from "matter-js";
import * as fs from 'fs'
import { Convert } from "../../interfaces/ITileMap.js";
import * as poly_decomp from 'poly-decomp'
import ServerConstants from "../constants.js";

export class TileType {
    public id:number
    public vertices:MatterJS.Vector[]
    public origin:MatterJS.Vector
}

export class TileMapInfo {
    public tiles:number[]
    public tileSize:number
    public width:number
    public height:number
}

export const Tiles = new Map<number, TileType>()
export const TileMap = new TileMapInfo()

export class LoadMapCommand extends Command<MainGame>
{
    execute()
    {
        try {
            MatterJS.Common.setDecomp(poly_decomp)
//            const file = fs.readFileSync('/config/www/assets/maps/test.tmj', 'utf-8')
            const file = fs.readFileSync('./public/assets/maps/test.tmj', 'utf-8')
            const tmj = Convert.toTmj(file);
            TileMap.tileSize = tmj.tilewidth
            TileMap.width = tmj.width
            TileMap.height = tmj.height
            if (!tmj.layers[0].data) {
                console.log(`Failed to read layer tile layout`)
                return
            }
            TileMap.tiles = tmj.layers[0].data
            console.log(`${TileMap.tiles.length} tiles in map grid`)

            for (const t of tmj.tilesets[0].tiles)
            {
                let tile = new TileType() 
                tile.id = t.id
                const polygon = t.objectgroup.objects[0]
                const polygonPos = MatterJS.Vector.create(polygon.x, polygon.y)
                if (!polygon.polygon) continue
                tile.vertices = new Array<MatterJS.Vector>()
                console.log(`crating tile id:${t.id}, pp:${polygonPos.x},${polygonPos.y}`)
                for (const p of polygon.polygon) {
                    let point = MatterJS.Vector.create(p.x, p.y)
                    tile.vertices.push(point)
                    tile.origin = polygonPos
                    console.log(`${point.x},${point.y}`)
                }
                Tiles.set(t.id, tile)
                console.log(`Tile ${t.id} added, now ${Tiles.size} tiles in map`)
            }
            console.log(`${Tiles.size} tiles loaded`)
        } catch (error) {
            console.log(error)
        }
    }
}

export class CreateMapInMatterCommand extends Command<MainGame>
{
    execute()
    {
        const matter = this.room.matterPhysics
        let tileIndex = 0;
        for (let h = 0; h < TileMap.height; h++) {
            for (let w = 0; w < TileMap.width; w++) {
                const tilePos = MatterJS.Vector.create(w*TileMap.tileSize + TileMap.tileSize/2, h*TileMap.tileSize+ TileMap.tileSize/2)
                console.log(`i:${tileIndex}, pos:${tilePos.x}, ${tilePos.y}, tileId:${TileMap.tiles[tileIndex]-1}`)
                const tile = Tiles.get(TileMap.tiles[tileIndex++]-1)
                if (!tile) {
                    console.log(`Failed to create tile`)
                    continue
                }
               // tile.vertices.forEach(v => console.log(`${v.x},${v.y}`))
                const vArrays = new Array<MatterJS.Vector[]>()
                vArrays.push(tile.vertices)
                const tileBody = MatterJS.Bodies.fromVertices(TileMap.tileSize/2, TileMap.tileSize/2, vArrays, 
                {
                    isStatic:true, 
                    collisionFilter: 
                    {
                        category: ServerConstants.COLLISION_CATEGORY_WALL, 
                        mask: ServerConstants.COLLISION_CATEGORY_PLAYER | ServerConstants.COLLISION_CATEGORY_PROJECTILE
                    }
                })
                const vAdjusted = new Array<MatterJS.Vector>()
                tile.vertices.forEach(v => vAdjusted.push(MatterJS.Vector.add(v, tile.origin)))
                const oldBB = CalcBounds(tile.vertices)
                const newBB = tileBody.bounds
                
                let centreKorr = MatterJS.Vector.create((oldBB[0]-newBB.min.x), (oldBB[1]-newBB.min.y))
                console.log(`${oldBB[0]}-${newBB.min.x}=${oldBB[0]-newBB.min.x},${oldBB[1]}-${newBB.min.y}=${oldBB[1]-newBB.min.y}`)
                MatterJS.Body.setPosition(tileBody, MatterJS.Vector.add(tile.origin, MatterJS.Vector.add(tilePos, centreKorr)))
                // const tileBounds = MatterJS.Bodies.rectangle(tilePos.x, tilePos.y, 32, 32, {isStatic:true})
                // MatterJS.Composite.add(matter.world, tileBounds)
                MatterJS.Composite.add(matter.world, tileBody)
            }
        }
    }
}
function CalcBounds(vertices: MatterJS.Vector[]):number[] {
    let minX=0, maxX=0, minY=0, maxY = 0
    for (const v of vertices) {
        minX = Math.min(minX, v.x)
        minY = Math.min(minY, v.y)
        maxX = Math.max(maxX, v.x)
        maxY = Math.max(maxY, v.y)
    }
    return [minX, minY, maxX, maxY]
}

