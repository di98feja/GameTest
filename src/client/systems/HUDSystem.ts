import Phaser, {GameObjects} from "phaser";
import { defineSystem, defineQuery, enterQuery} from "bitecs";
import Energy from "../components/Energy";
import Health from "../components/Health";
import Game from "../scenes/Game"

let healthText : GameObjects.Text
let energyText : GameObjects.Text

export function createHUDSystem(game:Game, textures: string[])
{
    const query = defineQuery([Health, Energy])
    const onQueryEnter = enterQuery(query)
    return defineSystem(world => {
        const enterEntities = onQueryEnter(world)
        for (const id of enterEntities)
        {
            const left = game.cameras.main.midPoint.x-game.cameras.main.width/2
            const top = game.cameras.main.midPoint.y-game.cameras.main.height/2
            healthText = game.add.text(left + 10, top, `${Health.currentHealth[id]}/${Health.maxHealth[id]}`)
            energyText = game.add.text(left + 100, top, `${Energy.currentEnergy[id]}/${Energy.maxEnergy[id]}`)
            healthText.setScrollFactor(0)
            energyText.setScrollFactor(0)
        }

        return world
    })
}

export function updateHUDSystem() {
    const query = defineQuery([Health, Energy])
    return defineSystem(world => {
        const entities = query(world)
        for (const id of entities)
        {
            healthText.setText(`${Health.currentHealth[id].toFixed(0)}/${Health.maxHealth[id]}`)
            energyText.setText(`${Energy.currentEnergy[id].toFixed(0)}/${Energy.maxEnergy[id]}`)
        }
        return world
    })
}
