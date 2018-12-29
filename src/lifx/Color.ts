import { HSBK } from "./HSBK";

export class Color implements HSBK {
    public static fromHSBK(hsbk: HSBK): Color {
        const color = new Color();
        color.hue = hsbk.hue;
        color.saturation = hsbk.saturation;
        color.brightness = hsbk.brightness;
        color.kelvin = hsbk.kelvin;
        return color;
    }

    public hue: number = 0;
    public saturation: number = 0;
    public brightness: number = 0;
    public kelvin: number = 0;
}
