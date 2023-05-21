import Colyseus from "colyseus";
import { Dispatcher } from "@colyseus/command";
import { MainGameState} from '../states/mainGameState.js'
import { MessageType, PlayerInputMessage } from "../../interfaces/Messages.js";
import { OnPlayerInputCommand, OnPlayerJoinedCommand, PlayerInputCommandPayload, OnPlayerLeaveCommand } from "../commands/PlayerCommands.js";
import MatterJS from "matter-js";
import { OnAfterPhysicsUpdateCommand } from "../commands/PhysicsCommands.js";

export default class MainGame extends Colyseus.Room<MainGameState>
{
    private dispatcher = new Dispatcher(this)
    public matterPhysics!: MatterJS.Engine
    public playerBodies = new Map<string, MatterJS.Body>()

    onCreate() 
    {
        this.matterPhysics = MatterJS.Engine.create()
        this.matterPhysics.gravity.x = 0
        this.matterPhysics.gravity.y = 0
        
        // var topWall = MatterJS.Bodies.rectangle(0, 20, 512, 20, { isStatic: true });
        // var leftWall = MatterJS.Bodies.rectangle(0, 512, 20, 512, { isStatic: true });
        // var rightWall = MatterJS.Bodies.rectangle(512-20, 512, -20, 512, { isStatic: true });
        // var bottomWall = MatterJS.Bodies.rectangle(0, 512, 512, 20, { isStatic: true });
        // MatterJS.Composite.add(this.matterPhysics.world, [topWall, leftWall, rightWall, bottomWall]) 

        this.maxClients = 10
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
        this.setSimulationInterval((deltaTime) => this.update(deltaTime))
    }

    update(deltaTime:number)
    {  
        MatterJS.Engine.update(this.matterPhysics, deltaTime)
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