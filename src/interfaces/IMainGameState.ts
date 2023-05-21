export interface IPlayerState
{
    x:number
    y:number
    direction:number
    velocityX:number
    velocityY:number
}

export interface IMainGameState
{
    players: Map<string, IPlayerState>
}