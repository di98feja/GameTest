import Phaser from "phaser";
import { defineSystem, defineQuery, enterQuery} from "bitecs";
import Position from "../components/Position";
import Sprite from "../components/Sprite";
import Rotation from "../components/Rotation";
import { Velocity } from "../components/Velocity";

const matterSpriteById = new Map<number, Phaser.Physics.Matter.Sprite>()

export function deleteSprite(localId:number)
{
    const body = matterSpriteById.get(localId)
    body?.destroy()
    matterSpriteById.delete(localId)
}

export function getPlayerSprites() {
    return matterSpriteById
}

export function createSpriteSystem(matter: Phaser.Physics.Matter.MatterPhysics, textures: string[])
{
    const query = defineQuery([Position, Sprite])
    const onQueryEnter = enterQuery(query)
    return defineSystem(world => {
        const enterEntities = onQueryEnter(world)
        for (const id of enterEntities)
        {
            const x = Position.x[id]
            const y = Position.y[id]
            const textureId = Sprite.texture[id]
            const sprite = matter.add.sprite(x, y, textures[textureId])
            sprite.setSensor(true)
            matterSpriteById.set(id, sprite)
        }

        return world
    })
}

export function createUpdateLocalSpritesSystem() {
    const query = defineQuery([Rotation, Velocity, Sprite, Position])
    return defineSystem(world => {
        const entities = query(world)
        for (const id of entities)
        {
            const sprite = matterSpriteById.get(id)
            if (!sprite) continue
            sprite.setPosition(Position.x[id], Position.y[id])
            sprite.angle = Rotation.angle[id]
            sprite.setVelocity(Velocity.x[id], Velocity.y[id])
        }
        return world
    })
}

export function createSpriteInterpolationSystem() {
    const query = defineQuery([Rotation, Velocity, Sprite])
    return defineSystem(world => {
        const entities = query(world)
        for (const id of entities)
        {
            const sprite = matterSpriteById.get(id)
            if (!sprite) continue
//            sprite.angle = Rotation.angle[id]
            sprite.setVelocity(Velocity.x[id], Velocity.y[id])
        }
        return world
    })
}

