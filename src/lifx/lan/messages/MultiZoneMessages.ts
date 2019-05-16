import { HSBK } from "../../HSBK";
import { LANProtocol } from "../LANProtocol";
import { MessageUtil } from "../utils/MessageUtil";
import { Message, PAYLOAD_OFFSET } from "./Message";

export enum MultiZoneMessage {
    SetColorZones = 501,
    GetColorZones = 502,
    StateZone = 503,
    StateMultiZone = 506,
}

/**
 * This type allows you to provide hints to the device about how the changes you make should be
 * performed. For example you can send multiple zones and have them all apply at once. Application
 * Request is stored as an unsigned 8-bit integer.
 */
export enum ApplicationRequest {
    /** Don't apply the requested changes until a message with APPLY or APPLY_ONLY is sent */
    NoApply = 0,

    /** Apply the changes immediately and apply any pending changes. */
    Apply = 1,

    /** Ignore the requested changes in this message and only apply pending changes. */
    ApplyOnly = 2,
}

/**
 * This message is used for changing the color of either a single or multiple zones.
 * The changes are stored in a buffer and are only applied once a message with
 * either `APPLY` or `APPLY_ONLY` set.
 */
export function SetColorZones(
    start: number = 0,
    end: number = 255,
    color: HSBK = { hue: 0, saturation: 0, brightness: 0, kelvin: 0 },
    duration: number = 0,
    apply: ApplicationRequest = ApplicationRequest.Apply
): Buffer {
    const payload = Buffer.allocUnsafe(15);
    payload.writeUInt8(start, 0);
    payload.writeUInt8(end, 1);
    payload.writeUInt16LE(color.hue, 2);
    payload.writeUInt16LE(color.saturation, 4);
    payload.writeUInt16LE(color.brightness, 6);
    payload.writeUInt16LE(color.kelvin, 8);
    payload.writeUInt32LE(duration, 10);
    payload.writeUInt8(apply, 14);
    return Message(MultiZoneMessage.SetColorZones, payload);
}

/**
 * GetColorZones is used to request the zone colors for a range of zones. The bulb will respond
 * with either StateZone or StateMultiZone messages as required to cover the requested range.
 * The bulb may send state messages that cover more than the requested zones. Any zones outside
 * the requested indexes will still contain valid values at the time the message was sent.
 */
export function GetColorZones(start: number = 0, end: number = 255): Buffer {
    const payload = Buffer.allocUnsafe(2);
    payload.writeUInt8(start, 0);
    payload.writeUInt8(end, 1);
    return Message(MultiZoneMessage.GetColorZones, payload);
}

LANProtocol.addParser(MultiZoneMessage.StateZone, message => {
    const count = message.readUInt8(PAYLOAD_OFFSET);
    const index = message.readUInt8(PAYLOAD_OFFSET + 1);
    const color = MessageUtil.readColor(message, PAYLOAD_OFFSET + 2);

    // const device = lifx.getOrCreateDevice(address);
    // const zone = device.getOrCreateZone(index, count);

    // console.log(`${address} > StateZone:`, {
    //     count,
    //     index,
    //     color,
    // });
});

LANProtocol.addParser(MultiZoneMessage.StateMultiZone, message => {
    const count = message.readUInt8(PAYLOAD_OFFSET);
    const index = message.readUInt8(PAYLOAD_OFFSET + 1);

    const colorsOffset = PAYLOAD_OFFSET + 2;
    const maxColorReadCount = Math.min(8, count - index);
    const colors = new Array<HSBK>(maxColorReadCount);
    for (let i = 0; i < maxColorReadCount; ++i) {
        colors[i] = MessageUtil.readColor(message, colorsOffset + i * 8);
    }

    // console.log(`${address} > StateMultiZone:`, {
    //     count,
    //     index,
    //     colors,
    // });
});
