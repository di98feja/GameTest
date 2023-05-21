import { Client, Room } from 'colyseus.js'
import Phaser from 'phaser'
import { IMainGameState } from '../../interfaces/IMainGameState'
import { MessageType, PlayerInputMessage } from '../../interfaces/Messages'

export enum Events {
    PlayerJoin,
    PlayerLeave,
    StateChanged,
    Ping
}

export default class Server {

    private client!: Client
    public events: Phaser.Events.EventEmitter
    private room?: Room<IMainGameState>

     constructor() {
       // this.client = new Client('wss://mptest.fernlof.se/colyseus')
        this.client = new Client('ws://localhost:2567')
        
        this.events = new Phaser.Events.EventEmitter()
    }

    async join():Promise<string>  {
        this.room = await this.client.joinOrCreate('main-game')
        console.log("Room joined or created")
        this.room.onStateChange((state) => {
            this.events.emit(Events.StateChanged.toString(), state)
        })
        this.room.onMessage("*",(type, msg:{sessionId:string}) => {
            if (type == MessageType.PlayerJoin) {
                console.log(`${msg.sessionId} join`)
                this.events.emit(Events.PlayerJoin.toString(), msg)
            }
            else if (type == MessageType.PlayerLeave) {
                this.events.emit(Events.PlayerLeave.toString(), msg)
            }
            else if (type == MessageType.Ping) {
                this.events.emit(Events.Ping.toString(), msg)
            }
        } )
        return this.room.sessionId
    }

    public async ping(t:number) 
    {
        if (!this.room) return
        await this.room.send(MessageType.Ping, t)
    }

    public async signalPlayerInput(inputMessage: PlayerInputMessage)
    {
        if (!this.room) return;
        await this.room.send(MessageType.PlayerInput, inputMessage)
    }

    stateChanged(cb: (state:any) => void, context?: any)
    {
        this.events.addListener(Events.StateChanged.toString(), cb, context)
    }
}