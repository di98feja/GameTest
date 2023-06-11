import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"
import MatterJS from "matter-js";

export class UpdateProjectilesCommand extends Command<MainGame, number>
{
    execute( t:number )
    {
        for (const proj of this.room.projectiles) {
            const p = proj[1]
            if (!p) continue
            if (p.ttl <= this.clock.currentTime) {
              //  console.log(`remove ${proj[0]} at ${p.body.position.x},${p.body.position.y}`)
                MatterJS.Composite.remove(this.room.matterPhysics.world, p.body, true)
                this.room.projectiles.delete(proj[0])
                this.state.projectiles.delete(proj[0])
            }
            else if (p.startTime + 100 <= this.clock.currentTime) {
                p.body.collisionFilter.group = 0
            }
            
        }
    }
}
