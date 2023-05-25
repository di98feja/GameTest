import { defineComponent, Types } from "bitecs";

export const Input = defineComponent({
    up: Types.ui8,
    down: Types.ui8,
    left: Types.ui8,
    right: Types.ui8,
    shift: Types.ui8,
    mouseX: Types.i32,
    mouseY: Types.i32,
    mouseLeft: Types.ui8,
    mouseRight: Types.ui8,
    mouseMiddle: Types.ui8
})

export default Input