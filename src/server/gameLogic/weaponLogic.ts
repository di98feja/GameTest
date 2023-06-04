import MatterJS from "matter-js";
import MainGame from "../rooms/mainGame.js";
import { ProjectileState } from "../states/mainGameState.js";

import pkg from 'colyseus';
const { generateId } = pkg;

const PROJECTILE_SPEED  = 8
const PROJECTILE_TTL_CHARGE_TO_MS_RATIO = 1
const PROJECTILE_TTL_MIN = 500

export class Projectile {
    ttl:number
    body:MatterJS.Body

    constructor(ttl:number, body:MatterJS.Body) {
        this.ttl = ttl
        this.body = body
    }
}

export function HandleWeaponLogic(firePressed:boolean, playerId:string, mainGame: MainGame)
{
    let player = mainGame.state.players.get(playerId)
    if (!player) return

    if (firePressed && player.weaponChargeStart == 0) {
        player.weaponChargeStart = mainGame.clock.currentTime
    }
    else if (!firePressed && player.weaponChargeStart > 0) {
        console.log('Adding projectile')
        const playerPos = MatterJS.Vector.create(player.x, player.y)
        const projectile = CreateWeaponProjectile(mainGame.playerBodies.get(playerId)?.id ?? 0, playerPos, player.direction)
        MatterJS.Composite.add(mainGame.matterPhysics.world, projectile)
        const projectileTTL = Math.max((mainGame.clock.currentTime - player.weaponChargeStart) * PROJECTILE_TTL_CHARGE_TO_MS_RATIO, PROJECTILE_TTL_MIN)
        mainGame.projectiles.set(projectile.label, new Projectile(mainGame.clock.currentTime + projectileTTL, projectile))
        const p = mainGame.projectiles.get(projectile.label)
        console.log(`p:${p?.ttl}, ${p?.body.label}`)
        const projectileState = CreateProjectileState(projectile)
        mainGame.state.projectiles.set(projectile.label, projectileState)
        player.weaponChargeStart = 0
    }
}

function CreateProjectileState(projectile: MatterJS.Body) : ProjectileState {
    let ps = new ProjectileState()
    ps.x = projectile.position.x
    ps.y = projectile.position.y
    ps.velocityX = projectile.velocity.x
    ps.velocityY = projectile.velocity.y
    return ps
}

function CreateWeaponProjectile(playerId: number, playerPos: MatterJS.Vector, direction: number) : MatterJS.Body {
    
    const projectile = MatterJS.Bodies.circle(playerPos.x, playerPos.y, 10, {density:1.0, friction:0.0, frictionAir:0.0, restitution:1.0, label:generateId(8), collisionFilter: {group:-playerId} })
    let spawnPosVector = MatterJS.Vector.create(0, 0)
    spawnPosVector = MatterJS.Vector.rotate(spawnPosVector, direction)
    let directionVector = MatterJS.Vector.create(PROJECTILE_SPEED, 0)
    directionVector = MatterJS.Vector.rotate(directionVector, direction)
    console.log(`dirVector:${directionVector.x},${directionVector.y}`)
    MatterJS.Body.setVelocity(projectile, directionVector)
    MatterJS.Body.setPosition(projectile, MatterJS.Vector.add(playerPos,spawnPosVector))
    console.log(`pv1:${projectile.speed}`)
return projectile
}
