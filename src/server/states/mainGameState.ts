import {Schema, MapSchema, type} from '@colyseus/schema'
import { IMainGameState, IPlayerState, IProjectileState } from '../../interfaces/IMainGameState.js'

export class PlayerState extends Schema implements IPlayerState
{
    @type('number') x: number = 0
    @type('number') y: number = 0
    @type('number') direction: number = 0
    @type('number') velocityX: number = 0
    @type('number') velocityY: number = 0
    @type('number') weaponChargeStart: number = 0
}

export class ProjectileState extends Schema implements IProjectileState
{
    @type('number') x: number = 0
    @type('number') y: number = 0
    @type('number') velocityX: number = 0
    @type('number') velocityY: number = 0
    @type('number') ttl: number = 0
}
export class MainGameState extends Schema implements IMainGameState
{
    @type({map: PlayerState}) players = new MapSchema<PlayerState>()
    @type({map: ProjectileState}) projectiles = new MapSchema<ProjectileState>()
}
