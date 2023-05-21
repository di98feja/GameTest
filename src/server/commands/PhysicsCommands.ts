import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"

export class OnAfterPhysicsUpdateCommand extends Command<MainGame>
{
    execute( )
    {
        for (const player of this.state.players)
        {
            const playerId = player[0]
            const playerState = player[1]
            const playerBody = this.room.playerBodies.get(playerId)
            if (!playerBody) continue
            playerState.x = playerBody.position.x
            playerState.y = playerBody.position.y
            playerState.direction = playerBody.angle
            playerState.velocityX = playerBody.velocity.x
            playerState.velocityY = playerBody.velocity.y

  //          console.log(`${playerId} x:${playerState.x.toFixed(0)}, y:${playerState.y.toFixed(0)}, vx:${playerState.velocityX.toFixed(1)}, vy:${playerState.velocityY.toFixed(1)}, a:${playerState.direction.toFixed(2)}`)
        }
    }
}
