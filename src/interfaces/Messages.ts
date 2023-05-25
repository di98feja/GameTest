export enum MessageType {
    PlayerJoin,
    PlayerLeave,
    PlayerInput,
    Ping
}

export enum MoveDirection {
    None = 0,
    Up = 1,
    Down = 2,
    Left = 4,
    Right = 8
}

export enum MouseButtons {
    None = 0,
    Left = 1,
    Right = 2,
    Middle = 4
}

export class PlayerInputMessage 
{
    playerId: string = ''
    moveDirection: number = 0
    angle: number = 0
    sprint: boolean = false
    pressedButtons: number = 0
}

