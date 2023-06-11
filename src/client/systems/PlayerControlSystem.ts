import Phaser from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Rotation from "../components/Rotation";
import Velocity from "../components/Velocity";
import Input from "../components/Input";
import Position from "../components/Position";

export function createPlayerStateUpdateSystem(speed = 100, sprintFactor = 2)
{
    const query = defineQuery([Input, Rotation, Velocity, Position])
    return defineSystem(world => {
        for (const id of query(world)){
            const isUp = !!Input.up[id]
            const isDown = !!Input.down[id]
            const isLeft = !!Input.left[id]
            const isRight = !!Input.right[id]
            const isSprint = !!Input.shift[id]

            const playerPos = new Phaser.Math.Vector2(Position.x[id], Position.y[id])
            const mousePos = new Phaser.Math.Vector2(Input.mouseX[id], Input.mouseY[id])
            Rotation.angle[id] = Phaser.Math.Angle.BetweenPoints(playerPos, mousePos)
            
            const currentSpeed = isSprint ? speed * sprintFactor : speed
            if (isUp) {
                Velocity.y[id] = -currentSpeed
            } else if(isDown) {
                Velocity.y[id] = currentSpeed
            }
            else {
                Velocity.y[id] = 0
            }

            if (isRight) {
                Velocity.x[id] = currentSpeed
            } else if(isLeft) {
                Velocity.x[id] = -currentSpeed
            } else {
                Velocity.x[id] = 0
            }
        }

        return world
    })
}