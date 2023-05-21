import { defineQuery, defineSystem } from "bitecs";

import Player from "../components/Player"
import { IMainGameState } from "../interfaces/IMainGameState";
import Position from "../components/Position";
import Rotation from "../components/Rotation";
import Velocity from "../components/Velocity";

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
//            console.log(`${playerId} x:${playerState.x.toFixed(0)}, y:${playerState.y.toFixed(0)}, vx:${playerState.velocityX.toFixed(1)}, vy:${playerState.velocityY.toFixed(1)}, a:${playerState.direction.toFixed(2)}`)
        }

        return world
    })
}