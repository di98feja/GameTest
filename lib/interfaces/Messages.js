export var MessageType;
(function (MessageType) {
    MessageType[MessageType["PlayerJoin"] = 0] = "PlayerJoin";
    MessageType[MessageType["PlayerLeave"] = 1] = "PlayerLeave";
    MessageType[MessageType["PlayerInput"] = 2] = "PlayerInput";
    MessageType[MessageType["Ping"] = 3] = "Ping";
})(MessageType || (MessageType = {}));
export var MoveDirection;
(function (MoveDirection) {
    MoveDirection[MoveDirection["None"] = 0] = "None";
    MoveDirection[MoveDirection["Up"] = 1] = "Up";
    MoveDirection[MoveDirection["Down"] = 2] = "Down";
    MoveDirection[MoveDirection["Left"] = 4] = "Left";
    MoveDirection[MoveDirection["Right"] = 8] = "Right";
})(MoveDirection || (MoveDirection = {}));
export class PlayerInputMessage {
    constructor() {
        this.playerId = '';
        this.moveDirection = 0;
        this.angle = 0;
        this.sprint = false;
    }
}
