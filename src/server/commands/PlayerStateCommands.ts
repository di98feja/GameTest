import { Command } from "@colyseus/command"
import MainGame from "../rooms/mainGame.js"
import ServerConstants from "../constants.js"

export class UpdatePlayerStatesCommand extends Command<MainGame, number>
{
    execute( t:number )
    {
        for (const p of this.state.players) {
            if (p[1].weaponCharge > 0 && p[1].currentEnergy > 0) {
                const charge = Math.min(t/ServerConstants.PROJECTILE_TTL_CHARGE_TO_MS_RATIO, p[1].currentEnergy)
                p[1].weaponCharge += charge
                p[1].currentEnergy -= charge
            }
            else if (p[1].currentEnergy < p[1].maxEnergy)
            {
                p[1].currentEnergy += Math.min(t/ServerConstants.PROJECTILE_TTL_RECHARGE_TO_MS_RATIO, p[1].maxEnergy - p[1].currentEnergy)
            }
        }
    }
}
