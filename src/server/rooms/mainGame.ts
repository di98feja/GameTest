import Colyseus from "colyseus";
import { Dispatcher } from "@colyseus/command";
import { MainGameState} from '../states/mainGameState.js'
import { MessageType, PlayerInputMessage } from "../../interfaces/Messages.js";
import { OnPlayerInputCommand, OnPlayerJoinedCommand, PlayerInputCommandPayload, OnPlayerLeaveCommand } from "../commands/PlayerCommands.js";
import MatterJS from "matter-js";
import { OnAfterPhysicsUpdateCommand } from "../commands/PhysicsCommands.js";
import { Projectile } from "../gameLogic/weaponLogic.js";
import { CreateMapInMatterCommand, LoadMapCommand } from "../commands/MapCommands.js";

export default class MainGame extends Colyseus.Room<MainGameState>
{
    private dispatcher = new Dispatcher(this)
    public matterPhysics!: MatterJS.Engine
    public playerBodies: Map<string, MatterJS.Body>
    public projectiles: Map<string, Projectile>

    onCreate() 
    {
        this.patchRate = 50 // millis between state update is sent to server
        this.maxClients = 10

        this.playerBodies = new Map<string, MatterJS.Body>()
        this.projectiles = new Map<string, Projectile>()

        this.matterPhysics = MatterJS.Engine.create()
        this.matterPhysics.gravity.x = 0
        this.matterPhysics.gravity.y = 0

        this.setState(new MainGameState())
        this.onMessage(MessageType.PlayerInput,  (client, message) => {
            const m = message as PlayerInputMessage
            this.dispatcher.dispatch(new OnPlayerInputCommand(), new PlayerInputCommandPayload(client.sessionId, m))
        })
        this.onMessage(MessageType.Ping, (client, message) => {
            client.send(MessageType.Ping, message)
        })
		MatterJS.Events.on(this.matterPhysics, 'afterUpdate', () => {
            this.dispatcher.dispatch(new OnAfterPhysicsUpdateCommand())
        })
        this.setSimulationInterval((deltaTime) => {  
            for (const proj of this.projectiles) {
                const p = proj[1]
                if (!p) continue
                if (p.ttl <= this.clock.currentTime) {
                    console.log(`remove ${proj[0]} at ${p.body.position.x},${p.body.position.y}`)
                    MatterJS.Composite.remove(this.matterPhysics.world, p.body, true)
                    this.projectiles.delete(proj[0])
                    this.state.projectiles.delete(proj[0])
                }
            }

            MatterJS.Engine.update(this.matterPhysics, deltaTime)
        })

        this.dispatcher.dispatch(new LoadMapCommand())
        this.dispatcher.dispatch(new CreateMapInMatterCommand())
    }

    onJoin(client:Colyseus.Client) {
        console.log('player added')
        this.dispatcher.dispatch(new OnPlayerJoinedCommand(), client.sessionId)
    }

    onLeave(client: Colyseus.Client, consented: boolean) {
        this.dispatcher.dispatch(new OnPlayerLeaveCommand(), client.sessionId)
    }

    onDispose() {
        console.log('Disposing!')
        this.dispatcher.stop()
    }
}