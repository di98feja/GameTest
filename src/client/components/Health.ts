import { defineComponent, Types } from "bitecs";

export const Health = defineComponent({
    maxHealth: Types.f32,
    currentHealth: Types.f32
})

export default Health