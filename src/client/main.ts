import Phaser from 'phaser'

import Game from './scenes/Game'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 512,
	height: 512,
	physics: {
		default: 'matter',
		matter: {
			gravity: { y: 0 },
			debug: false
		},
	},
	fps: {min:60},
	scene: [Game],
}

export default new Phaser.Game(config)
