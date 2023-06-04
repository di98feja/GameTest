import Game, { MapKeys, Maps, TileKeys } from "../scenes/Game";

export default class MapManager {

    public static initMap(game:Game,  mapId:Maps) 
    {
        const map = game.add.tilemap(MapKeys[mapId]);
        const tileset = map.addTilesetImage(TileKeys[mapId]);
        if (!tileset) {
            console.log('Failed to create tileset')
            return
        }

        const layer = map.createLayer('layer1', tileset, 0, 0);
        if (!layer) {
            console.log('Failed to create map layer')
            return
        }

        game.matter.world.setBounds(0, 0, layer.width, layer.height);
    }
}