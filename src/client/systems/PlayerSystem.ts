import Phaser from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Player from "../components/Player";
import Input from "../components/Input";

export function playerInputSystem(keyboard: Phaser.Input.Keyboard.KeyboardPlugin|null, mouse: Phaser.Input.Pointer, camera: Phaser.Cameras.Scene2D.Camera) 
{
    const query = defineQuery([Player, Input])
    return defineSystem(world => {
        const entities = query(world)
        for (const id in entities)
        {
            if (keyboard) {
                Input.shift[id] = keyboard.checkDown(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)) ? 1 : 0
                Input.up[id] = keyboard.checkDown(keyboard.addKey('W')) ? 1 : 0
                Input.down[id] = keyboard.checkDown(keyboard.addKey('S')) ? 1 : 0
                Input.left[id] = keyboard.checkDown(keyboard.addKey('A')) ? 1 : 0
                Input.right[id] = keyboard.checkDown(keyboard.addKey('D')) ? 1 : 0
            }
            const mx =  mouse.x + camera.scrollX
			const my =  mouse.y + camera.scrollY

            Input.mouseX[id] = mx,
            Input.mouseY[id] = my
            Input.mouseLeft[id] = mouse.leftButtonDown() ? 1 : 0
            Input.mouseRight[id] = mouse.rightButtonDown() ? 1 : 0
            Input.mouseMiddle[id] = mouse.middleButtonDown() ? 1 : 0
        }
        return world
    })
}