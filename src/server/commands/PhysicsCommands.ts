import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"
import MatterJS from "matter-js";

export class OnAfterPhysicsUpdateCommand extends Command<MainGame>
{
    execute()
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
        for (const p of this.state.projectiles)
        {
            const projectileId = p[0]
            const projectileState = p[1]
            const projectile = this.room.projectiles.get(projectileId)
            if (!projectile) continue
            const projectileBody = projectile.body
            projectileState.x = projectileBody.position.x
            projectileState.y = projectileBody.position.y
            projectileState.velocityX = projectileBody.velocity.x
            projectileState.velocityY = projectileBody.velocity.y
            projectileState.ttl = projectile.ttl
            projectileBody.motion
            const v2 = MatterJS.Vector.create(projectileBody.velocity.x, projectileBody.velocity.y)
            console.log(`Velocity:${MatterJS.Vector.magnitude(v2)}`)
            console.log(`Speed:${projectileBody.speed}`)
            console.log(`Motion:${projectileBody.motion}`)
        }  
    }
}
