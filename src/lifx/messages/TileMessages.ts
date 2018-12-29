import { HSBK } from "../HSBK";
import { Message } from "./Message";

export enum TileMessage {
    GetDeviceChain = 701,
    StateDeviceChain = 702,
    SetUserPosition = 703,
    GetTileState64 = 707,
    StateTileState64 = 711,
    SetTileState64 = 715,
}

/**
 * This message returns information about the tiles in the chain.
 * It responds with a `StateDeviceChain` message.
 */
export function GetDeviceChain(): Buffer {
    return Message(TileMessage.GetDeviceChain);
}

/**
 * Used to tell each tile what their position is.
 *
 * @param index Tile index
 * @param x Tile x position
 * @param y Tile y position
 */
export function SetUserPosition(index: number, x: number, y: number): Buffer {
    const payload = Buffer.allocUnsafe(11);
    payload.writeUInt8(index, 0);
    payload.writeUInt16LE(0, 1); // Reserved
    payload.writeFloatLE(x, 3);
    payload.writeFloatLE(y, 7);
    return Message(TileMessage.SetUserPosition, payload);
}

/**
 * Get the state of 64 pixels in the tile in a rectangle that has a starting point and width.
 *
 * @param index Tile index used to control the starting tile in the chain
 * @param length Used to get the state of that many tiles beginning from the `tile_index`. This will
 *               result in a separate response from each tile.
 * @param x For the LIFX Tile it really only makes sense to set x to zero
 * @param y For the LIFX Tile it really only makes sense to set y to zero
 * @param width For the LIFX Tile it really only makes sense to set width to 8.
 * @constructor
 */
export function GetTileState64(
    index: number,
    length: number = 1,
    x: number = 0,
    y: number = 0,
    width: number = 8
): Buffer {
    const payload = Buffer.allocUnsafe(6);
    payload.writeUInt8(index, 0);
    payload.writeUInt8(length, 1);
    payload.writeUInt8(0, 2); // Reserved
    payload.writeUInt8(x, 3);
    payload.writeUInt8(y, 4);
    payload.writeUInt8(width, 5);
    return Message(TileMessage.GetTileState64, payload);
}

/**
 * Get the state of 64 pixels in the tile in a rectangle that has a starting point and width.
 *
 * @param index Tile index used to control the starting tile in the chain
 * @param colors 64 HSBK values
 * @param duration Transition duration in milliseconds
 * @param length Used to get the state of that many tiles beginning from the `tile_index`. This will
 *               result in a separate response from each tile.
 * @param x For the LIFX Tile it really only makes sense to set x to zero
 * @param y For the LIFX Tile it really only makes sense to set y to zero
 * @param width For the LIFX Tile it really only makes sense to set width to 8.
 * @constructor
 */
export function SetTileState64(
    index: number,
    colors: Array<HSBK>,
    duration: number = 0,
    length: number = 1,
    x: number = 0,
    y: number = 0,
    width: number = 8
): Buffer {
    if (colors.length !== 64) {
        throw TypeError("colors must contain exactly 64 HSBK values");
    }
    const payload = Buffer.allocUnsafe(6);
    payload.writeUInt8(index, 0);
    payload.writeUInt8(length, 1);
    payload.writeUInt8(0, 2); // Reserved
    payload.writeUInt8(x, 3);
    payload.writeUInt8(y, 4);
    payload.writeUInt8(width, 5);
    payload.writeUInt32LE(duration, 6);
    // TODO: Write colors
    return Message(TileMessage.SetTileState64, payload);
}
