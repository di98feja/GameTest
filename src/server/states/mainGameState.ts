import {Schema, MapSchema, ArraySchema, type} from '@colyseus/schema'
import { IDebugInfo, IMainGameState, IPlayerState, IProjectileState, IVec2 } from '../../interfaces/IMainGameState.js'

export class PlayerState extends Schema implements IPlayerState
{
    @type('number') x: number = 0
    @type('number') y: number = 0
    @type('number') direction: number = 0
    @type('number') velocityX: number = 0
    @type('number') velocityY: number = 0
    @type('number') weaponCharge: number = 0
    @type('number') maxHealth: number = 100
    @type('number') currentHealth: number = 100
    @type('number') maxEnergy: number = 100
    @type('number') currentEnergy: number = 100
    @type('boolean') isSprinting: boolean = false
    @type('number') speed: number = 2
}

export class ProjectileState extends Schema implements IProjectileState
{
    @type('number') x: number = 0
    @type('number') y: number = 0
    @type('number') velocityX: number = 0
    @type('number') velocityY: number = 0
    @type('number') ttl: number = 0
}

export class Vec2 extends Schema implements IVec2 {
    @type('number') x: number = 0
    @type('number') y: number = 0
}

export class DebugInfo extends Schema implements IDebugInfo {
    @type(Vec2) origin: IVec2 
    @type([Vec2]) vertices = new ArraySchema<IVec2>()
    @type('boolean') isStatic: boolean = false
}

export class MainGameState extends Schema implements IMainGameState
{
    @type({map: PlayerState}) players = new MapSchema<PlayerState>()
    @type({map: ProjectileState}) projectiles = new MapSchema<ProjectileState>()
    @type({map: DebugInfo}) debugBodies = new MapSchema<DebugInfo>()
}
