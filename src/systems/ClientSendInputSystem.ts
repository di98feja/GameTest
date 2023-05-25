import { defineQuery, defineSystem } from "bitecs";

import Player from "../components/Player"
import Input from "../components/Input"
import Server from "../client/services/server";
import { MouseButtons, MoveDirection, PlayerInputMessage } from "../interfaces/Messages";
import Position from "../components/Position";

export function createClientSendInputSystem(server: Server, idMap: Map<number,string>)
{
    const query = defineQuery([Player, Input, Position])
    return defineSystem(world => {
        for (const id of query(world))
        {
            
            const inputMessage = new PlayerInputMessage()
            const playerId = idMap.get(id)
            if (!playerId) continue
            inputMessage.playerId = playerId 
            inputMessage.moveDirection = (Input.up[id] ? MoveDirection.Up : 0) 
                                    + (Input.down[id] ? MoveDirection.Down : 0)
                                    + (Input.left[id] ? MoveDirection.Left : 0)
                                    + (Input.right[id] ? MoveDirection.Right : 0)
            const playerPos = new Phaser.Math.Vector2(Position.x[id], Position.y[id])
            const mousePos = new Phaser.Math.Vector2(Input.mouseX[id], Input.mouseY[id])
            inputMessage.angle = Phaser.Math.Angle.BetweenPoints(playerPos, mousePos)
            inputMessage.sprint = !!Input.shift[id]
            inputMessage.pressedButtons = (Input.mouseLeft[id] ? MouseButtons.Left : 0)
                                    + (Input.mouseRight[id] ? MouseButtons.Right : 0)
                                    + (Input.mouseMiddle[id] ? MouseButtons.Middle : 0)
            server?.signalPlayerInput(inputMessage)
        }

        return world
    })
}