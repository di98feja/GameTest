import { defineQuery, defineSystem } from "bitecs";

import Player from "../components/Player"
import { IMainGameState } from "../interfaces/IMainGameState";
import Position from "../components/Position";
import Rotation from "../components/Rotation";
import Velocity from "../components/Velocity";
import Projectile from "../components/Projectile";

export function createClientReceiveStateSystem(idMap: Map<number,string>, gameState?: IMainGameState)
{
    const query = defineQuery([Player, Position, Rotation, Velocity])
    return defineSystem(world => {

        for (const id of query(world))
        {
            const playerId = idMap.get(id)
            if (!playerId) continue
            const playerState = gameState?.players.get(playerId)
            if (!playerState) continue
            Position.x[id] = playerState.x
            Position.y[id] = playerState.y
            Rotation.angle[id] = Phaser.Math.RadToDeg(playerState.direction)
            Velocity.x[id] = playerState.velocityX
            Velocity.y[id] = playerState.velocityY
            console.log(`${playerId} x:${playerState.x.toFixed(0)}, y:${playerState.y.toFixed(0)}, vx:${playerState.velocityX.toFixed(1)}, vy:${playerState.velocityY.toFixed(1)}, a:${playerState.direction.toFixed(2)}`)
        }

        return world
    })
}
export function createClientReceiveProjectileStateSystem(idMap: Map<number,string>, gameState?: IMainGameState)
{
    const query = defineQuery([Projectile, Position, Velocity])
    return defineSystem(world => {
        for (const id of query(world))
        {
            const projectileId = idMap.get(id)
            if (!projectileId) continue
            const projectileState = gameState?.projectiles.get(projectileId)
            if (!projectileState) continue
            Position.x[id] = projectileState.x
            Position.y[id] = projectileState.y
            Velocity.x[id] = projectileState.velocityX
            Velocity.y[id] = projectileState.velocityY
        }

        return world
    })
}

const serverDebugIdToClientObj = new Map<string, MatterJS.BodyType>()
let matterDebugGraphics: Phaser.GameObjects.Graphics
export function createClientReceiveDebugStateSystem(matter: Phaser.Physics.Matter.MatterPhysics, gameState?:IMainGameState) 
{
    if (!gameState) return
    if (!matterDebugGraphics) matterDebugGraphics = matter.world.createDebugGraphic()
    matter.world.drawDebug = false
    matterDebugGraphics.clear()
    for (const debugObj of gameState.debugBodies) {
        if (serverDebugIdToClientObj.has(debugObj[0])) {
            if (debugObj[1].isStatic) continue

            let clientBody = serverDebugIdToClientObj.get(debugObj[0])
            if (!clientBody) continue

            const newPos = matter.vector.create(debugObj[1].origin.x, debugObj[1].origin.y)
            matter.body.setPosition(clientBody, newPos, false)
        }
        else {
            const dvs = new Array<MatterJS.Vector[]>()
            const dv = new Array<MatterJS.Vector>()
            const c = matter.vector.create(debugObj[1].origin.x, debugObj[1].origin.y)
            for (const sv of debugObj[1].vertices) {
                const v = matter.vector.create(sv.x, sv.y)
                let v2 = matter.vector.sub(c, v)
                v2 = matter.vector.mult(v2,4)
                dv.push(v)
                console.log(`${v.x},${v.y}`)
            }
            const verts = [
                {x : 0 , y : 0},
                {x : 0 , y : 20},
                {x : 10 , y : 10},
            ]
            dvs.push(verts)
            dvs.push(dv)
            console.log(`pos:${debugObj[1].origin.x},${debugObj[1].origin.y}`)
            let newBody = matter.bodies.fromVertices(debugObj[1].origin.x, debugObj[1].origin.y, dvs, { isStatic: debugObj[1].isStatic, isSensor:true })
            matter.world.renderConvexHull(newBody, matterDebugGraphics, Phaser.Display.Color.GetColor(255, 0, 0), 1)
        }
        console.log(`num debug bodies:${gameState.debugBodies.size}`)
        for (const id of Array.from(serverDebugIdToClientObj.keys()).filter((k) => !gameState.debugBodies.has(k))) {
            serverDebugIdToClientObj.delete(id)
        }
    }
}