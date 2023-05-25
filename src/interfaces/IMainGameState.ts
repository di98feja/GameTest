export interface IPlayerState
{
    x:number
    y:number
    direction:number
    velocityX:number
    velocityY:number
}

export interface IProjectileState{
    x:number
    y:number
    velocityX:number
    velocityY:number
    ttl: number
}

export interface IMainGameState
{
    players: Map<string, IPlayerState>
    projectiles: Map<string, IProjectileState>
}