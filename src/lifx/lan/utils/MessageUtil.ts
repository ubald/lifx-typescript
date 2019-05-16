import { HSBK } from "../../HSBK";

export class MessageUtil {
    public static readString(buffer: Buffer, start: number, length: number): string {
        return Buffer.from(buffer.subarray(start, start + length).filter(value => value > 0)).toString("utf8");
    }

    public static readColor(buffer: Buffer, offset: number): HSBK {
        return {
            hue: buffer.readUInt16LE(offset),
            saturation: buffer.readUInt16LE(offset + 2),
            brightness: buffer.readUInt16LE(offset + 4),
            kelvin: buffer.readUInt16LE(offset + 6),
        };
    }

    public static writeColor(buffer: Buffer, color: HSBK, offset: number = 0): void {
        buffer.writeUInt16LE(color.hue, offset);
        buffer.writeUInt16LE(color.saturation, offset + 2);
        buffer.writeUInt16LE(color.brightness, offset + 4);
        buffer.writeUInt16LE(color.brightness, offset + 6);
    }
}
