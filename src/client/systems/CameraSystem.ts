import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery} from "bitecs";
import Player from '../components/Player.js'
import {getPlayerSprites} from './SpriteSystem.js'
import Camera from '../components/Camera.js';

export function cameraFollowSystem(mainCamera: Phaser.Cameras.Scene2D.Camera)
{
    const query = defineQuery([Player, Camera])
    const onQueryEnter = enterQuery(query)
    return defineSystem(world => {
        const enterEntities = onQueryEnter(world)
        for (const id of enterEntities) {
            const playerSprite = getPlayerSprites().get(id)
            if (playerSprite) {
                mainCamera.startFollow(playerSprite, true, 0.8, 0.8)
            }
        }
        return world
    })
}
