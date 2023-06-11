import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"
import MatterJS from "matter-js";
import { DebugInfo, Vec2 } from "../states/mainGameState.js";

const SEND_DEBUG_BODY_OUTLINES = false;

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
            // const v2 = MatterJS.Vector.create(projectileBody.velocity.x, projectileBody.velocity.y)
            // console.log(`Velocity:${MatterJS.Vector.magnitude(v2)}`)
            // console.log(`Speed:${projectileBody.speed}`)
            // console.log(`Motion:${projectileBody.motion}`)
        }  
        if (SEND_DEBUG_BODY_OUTLINES) 
        {
            for (const body of MatterJS.Composite.allBodies(this.room.matterPhysics.world)) {
                if (body.isStatic && this.state.debugBodies.has(body.id.toString())) continue
                const di = CreateDebugInfo(body);
                this.state.debugBodies.set(body.id.toString(), di)

                if (body.parts.length > 1) {
                    console.log(`di:${body.id}, parts:${body.parts.length}`)

                    for (let i = 0; i < body.parts.length; i++) {
                        if (i == 0) continue
                        const part = body.parts[i]
                        const dip = CreateDebugInfo(part)
                        console.log(`dip:${part.id}, v: ${part.vertices.length}`)
                        this.state.debugBodies.set(part.id.toString(), dip)
                    }
                }
            }

            for (const id of Array.from(this.state.debugBodies.keys()).filter((k) => !MatterJS.Composite.allBodies(this.room.matterPhysics.world).find((b) => b.id.toString() == k))) {
                this.state.debugBodies.delete(id)
            }
        }

        function CreateDebugInfo(body: MatterJS.Body) {
            const di = new DebugInfo();
            di.origin = new Vec2();
            di.origin.x = body.position.x;
            di.origin.y = body.position.y;
            for (const v of body.vertices) {
                const dv = new Vec2();
                dv.x = v.x;
                dv.y = v.y;
                di.vertices.push(dv);
            }
            di.isStatic = body.isStatic;
            return di;
        }
    }
}
