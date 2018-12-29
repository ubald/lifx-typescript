import { Color } from "./Color";
import { HSBK } from "./HSBK";

export class Zone {
    public color: Color;

    constructor(color?: HSBK | Color) {
        if (color) {
            if (color instanceof Color) {
                this.color = color;
            } else {
                this.color = Color.fromHSBK(color);
            }
        } else {
            this.color = new Color();
        }
    }
}
