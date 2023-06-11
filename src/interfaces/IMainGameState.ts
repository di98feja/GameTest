export interface IPlayerState
{
    x:number
    y:number
    direction:number
    velocityX:number
    velocityY:number
    maxHealth:number
    currentHealth:number
    maxEnergy:number
    currentEnergy:number
    isSprinting:boolean
    speed:number
}

export interface IProjectileState{
    x:number
    y:number
    velocityX:number
    velocityY:number
    ttl: number
}

export interface IVec2 {
    x:number
    y:number
}

export interface IDebugInfo {
    origin:IVec2
    vertices:Array<IVec2>
    isStatic:boolean
}

export interface IMainGameState
{
    players: Map<string, IPlayerState>
    projectiles: Map<string, IProjectileState>
    debugBodies: Map<string, IDebugInfo>
}