var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Schema, MapSchema, type } from '@colyseus/schema';
export class PlayerState extends Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.direction = 0;
        this.velocityX = 0;
        this.velocityY = 0;
    }
}
__decorate([
    type('number')
], PlayerState.prototype, "x", void 0);
__decorate([
    type('number')
], PlayerState.prototype, "y", void 0);
__decorate([
    type('number')
], PlayerState.prototype, "direction", void 0);
__decorate([
    type('number')
], PlayerState.prototype, "velocityX", void 0);
__decorate([
    type('number')
], PlayerState.prototype, "velocityY", void 0);
export class MainGameState extends Schema {
    constructor() {
        super(...arguments);
        this.players = new MapSchema();
    }
}
__decorate([
    type({ map: PlayerState })
], MainGameState.prototype, "players", void 0);
