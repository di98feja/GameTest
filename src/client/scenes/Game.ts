import Phaser, {GameObjects} from 'phaser'
import { createWorld, addEntity, removeEntity, addComponent, IWorld, pipe } from 'bitecs'
import Server, {Events} from '../services/server'

// Components
import Position from '../../components/Position'
import Sprite from '../../components/Sprite'
import Rotation from '../../components/Rotation'
import Player from '../../components/Player'
import Input from '../../components/Input'

// Systems
import { deleteSprite, createUpdateLocalSpritesSystem, createSpriteInterpolationSystem, createSpriteSystem, getPlayerSprites } from '../../systems/SpriteSystem'
import { createPlayerSystem as createPlayerInputSystem } from '../../systems/PlayerSystem'
import Velocity from '../../components/Velocity'
import { IMainGameState } from '../../interfaces/IMainGameState'
import { createClientSendInputSystem } from '../../systems/ClientSendInputSystem'
import { createClientReceiveStateSystem } from '../../systems/ClientReceiveStateSystem'
import { createPlayerStateUpdateSystem } from '../../systems/PlayerControlSystem'
enum Textures
{
	Star = 0
}

const TextureKeys = [
	'star'
]

export default class Game extends Phaser.Scene {

	private worldECS?: IWorld
	private clientUpdatePipeline?: (world: IWorld) => void
	private server!: Server
	private currentState?: IMainGameState
	private localIdToServerIdMap = new Map<number,string>()
	private ServerIdToLocalIdMap = new Map<string, number>()

	private msgText? : GameObjects.Text
    private msgTextTimeout : number = 0

	private dbgText? : GameObjects.Text
	private showDebugText = true
	private myServerId!:string

    private pingTime = 0

	constructor() {
		super('game')
	}

	preload() {
		this.load.image(TextureKeys[Textures.Star], 'assets/star.png')
	}

	init() 
	{
		this.server = new Server()
	}

	async create() 
	{
		const myId = await this.server.join()
		this.myServerId = myId

		this.worldECS = createWorld();
		this.createPlayer(myId, this.worldECS, true)

		this.server.events.addListener(Events.PlayerJoin.toString(), (msg:{sessionId:string}) => {
			const newPlayerId = msg.sessionId;
			this.msgText = this.add.text(this.scale.displaySize.width/2, this.scale.displaySize.height/2, `${newPlayerId} joined!`)
			this.msgTextTimeout = this.time.now + 1000
		})

        this.server.events.addListener(Events.PlayerLeave.toString(), (msg:{sessionId:string}) => {
			console.log(`${msg.sessionId} left`)
            const playerId = msg.sessionId;
            if (!this.ServerIdToLocalIdMap.has(playerId)) return;
			const localId = this.ServerIdToLocalIdMap.get(playerId);
			if (!this.worldECS || !localId) return
            removeEntity(this.worldECS, localId)
            this.ServerIdToLocalIdMap.delete(playerId)
			deleteSprite(localId)
            this.msgText = this.add.text(this.scale.displaySize.width/2, this.scale.displaySize.height/2, `${playerId} left!`)
            this.msgTextTimeout = this.time.now + 2000
        })

		this.server.stateChanged(s => {
			this.currentState = s as IMainGameState
			if (!this.worldECS) return

			for (const p of this.currentState.players) {
				if (!this.ServerIdToLocalIdMap.has(p[0])) {
					console.log(`adding ${p[0]}`)
					this.createPlayer(p[0], this.worldECS, false)
				}
			}

			createClientReceiveStateSystem(this.localIdToServerIdMap, this.currentState)(this.worldECS)
			createUpdateLocalSpritesSystem()(this.worldECS)
		})

		this.clientUpdatePipeline = pipe(
			createSpriteSystem(this.matter, TextureKeys),
			createPlayerInputSystem(this.input.keyboard, this.input.activePointer),
			createClientSendInputSystem(this.server, this.localIdToServerIdMap),
			createPlayerStateUpdateSystem(2, 2),
			createSpriteInterpolationSystem(),
		)
		
		this.server.events.addListener(Events.Ping.toString(), (msg:number) => {
			console.log(`ping received ${this.time.now}`)
			this.pingTime = this.time.now - msg;
		})
		const pingTimer = new Phaser.Time.TimerEvent({delay:100, loop:true, callback: () => {
			console.log(`ping sent ${this.time.now}`)
			this.server.ping(this.time.now)
		}})
		this.time.addEvent(pingTimer)
	}

	private createPlayer(serverId: string, world:IWorld, isLocal:boolean) {
		const localId = addEntity(world)
		this.localIdToServerIdMap.set(localId, serverId)
		this.ServerIdToLocalIdMap.set(serverId, localId)
		addComponent(world, Position, localId)
		addComponent(world, Rotation, localId)
		addComponent(world, Velocity, localId)
		addComponent(world, Sprite, localId)
		addComponent(world, Player, localId)
		const encoder = new TextEncoder()
		Player.playerId[localId].set(encoder.encode(serverId))
		Position.x[localId] = 200
		Position.y[localId] = 200
		Rotation.angle[localId] = 0.0
		Sprite.texture[localId] = Textures.Star
		if (isLocal) {
			addComponent(world, Input, localId)
		}
	}

	update(t: number, d: number): void 
	{
		if (!this.worldECS || !this.clientUpdatePipeline)	return
		this.clientUpdatePipeline(this.worldECS)

		if (this.msgText && this.msgTextTimeout < this.time.now) {
            this.msgText.setVisible(false)
            this.msgText.destroy()
        }

		if (this.showDebugText) {
			const players = getPlayerSprites()
			const me = players.get(0)
			if (!me) return
			let s = `ping:${this.pingTime.toFixed(0)}\ntime:${t.toFixed(1)}, delta:${d.toFixed(1)}\nMe:  ${this.myServerId}(${me.x.toFixed(0)}, ${me.y.toFixed(0)})`
			for (const k of players.keys()) {
				if (k != 0) {
					s = `${s}\nThem:${this.localIdToServerIdMap.get(k)}(${players.get(k)?.x.toFixed(0)}, ${players.get(k)?.y.toFixed(0)})`
				}	
			}
			if (!this.dbgText) {
				this.dbgText =  this.add.text(0, this.scale.displaySize.height-15*(players.size+2), s)
			}
			else {
				this.dbgText.text = s
			}
		}
		else {
			this.dbgText?.setVisible(false)
			this.dbgText?.destroy()
		}
	}
}
