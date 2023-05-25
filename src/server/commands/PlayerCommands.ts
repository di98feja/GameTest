import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"
import { PlayerState } from "../states/mainGameState.js"
import { MessageType, MouseButtons, MoveDirection, PlayerInputMessage } from "../../interfaces/Messages.js"
import MatterJS from "matter-js";
import { HandleWeaponLogic } from "../gameLogic/weaponLogic.js";

export class OnPlayerJoinedCommand extends Command<MainGame, string>
{
    execute( sessionId:string )
    {
        const newPlayer = new PlayerState()
        newPlayer.x = 50
        newPlayer.y = 50
        this.state.players.set(sessionId, newPlayer)
        const body = MatterJS.Bodies.circle(50, 50, 15, {density:1, friction:1, restitution:0.9})
        MatterJS.Composite.add(this.room.matterPhysics.world, body)
        this.room.playerBodies.set(sessionId, body)
        this.room.broadcast(MessageType.PlayerJoin, {sessionId})
    }
}

export class OnPlayerLeaveCommand extends Command<MainGame, string> 
{
  execute( sessionId ) 
  {
    const playerBody = this.room.playerBodies.get(sessionId)
    if (!playerBody) return
    MatterJS.Composite.remove(this.room.matterPhysics.world, playerBody, true)
    this.state.players.delete(sessionId)
    this.room.playerBodies.delete(sessionId)
    this.room.broadcast(MessageType.PlayerLeave, {sessionId})
  }
}

export class PlayerInputCommandPayload
{
    public sessionId:string
    public message:PlayerInputMessage

    constructor(sessionId:string, message:PlayerInputMessage) {
        this.sessionId = sessionId
        this.message = message
    }
}

export class OnPlayerInputCommand extends Command<MainGame, PlayerInputCommandPayload>
{
    execute( payload:PlayerInputCommandPayload )
    {
        const playerBody = this.room.playerBodies.get(payload.sessionId)
        if (!playerBody) return;
        playerBody.angle = payload.message.angle
        const sprint = payload.message.sprint
        const currentSpeed = sprint ? 4 : 2
        const isUp = !!(payload.message.moveDirection & MoveDirection.Up)
        const isDown = !!(payload.message.moveDirection & MoveDirection.Down)
        const isLeft = !!(payload.message.moveDirection & MoveDirection.Left)
        const isRight = !!(payload.message.moveDirection & MoveDirection.Right)
        if (isUp) {
            MatterJS.Body.setVelocity(playerBody, MatterJS.Vector.create(playerBody.velocity.x, -currentSpeed))
        } else if(isDown) {
            MatterJS.Body.setVelocity(playerBody, MatterJS.Vector.create(playerBody.velocity.x, currentSpeed))
        } else {
            MatterJS.Body.setVelocity(playerBody, MatterJS.Vector.create(playerBody.velocity.x, 0))
        }

        if (isRight) {
            MatterJS.Body.setVelocity(playerBody, MatterJS.Vector.create(currentSpeed, playerBody.velocity.y))
        } else if(isLeft) {
            MatterJS.Body.setVelocity(playerBody, MatterJS.Vector.create(-currentSpeed, playerBody.velocity.y))
        } else {
            MatterJS.Body.setVelocity(playerBody, MatterJS.Vector.create(0, playerBody.velocity.y))
        }

        const isLeftMouse = !!(payload.message.pressedButtons & MouseButtons.Left)
        const isRightMouse = !!(payload.message.pressedButtons & MouseButtons.Right)
        const isMiddleMouse = !!(payload.message.pressedButtons & MouseButtons.Middle)
        HandleWeaponLogic(isLeftMouse, payload.sessionId, this.room)
    }
}

