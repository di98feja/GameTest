import { defineComponent, Types } from "bitecs";

export const Player = defineComponent({
    playerId: [Types.ui8, 10]
})

export default Player