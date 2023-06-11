import { defineComponent, Types } from "bitecs";

export const Energy = defineComponent({
    maxEnergy: Types.f32,
    currentEnergy: Types.f32
})

export default Energy