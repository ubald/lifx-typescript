import { HSBK } from "../HSBK";
import { Message } from "./Message";

export enum LightMessage {
    Get = 101,
    SetColor = 102,
    SetWaveform = 103,
    SetWaveformOptional = 119,
    State = 107,
    GetPower = 116,
    SetPower = 117,
    StatePower = 118,
    GetInfrared = 120,
    StateInfrared = 121,
    SetInfrared = 122,
}

/**
 * The LIFX LAN protocol supports changing the color of a bulb over time in accordance with the
 * shape of a waveform.
 *
 * These waveforms allow us to combine functions such as fading, pulsing, etc by applying waveform
 * interpolation on the modulation between two colors.
 */
export enum Waveform {
    /**
     * Light interpolates linearly from current color to `color`
     * Duration of each cycle lasts for `period` milliseconds
     */
    Saw = 0,

    /**
     * The color will cycle smoothly from current color to `color` and then end back at current color
     * The duration of one cycle will last for `period` milliseconds
     */
    Sine = 1,

    /**
     * Light interpolates smoothly from current color to `color`
     * Duration of each cycle lasts for `period` milliseconds
     */
    HalfSine = 2,

    /**
     * Light interpolates linearly from current color to `color`, then back to current color
     * Duration of each cycle lasts for `period` milliseconds
     */
    Triangle = 3,

    /**
     * Pulse waveforms use the `skew_ratio` parameter
     * The color will be set immediately to `color`, then to current color after the duty cycle
     * fraction expires. The duty cycle percentage is calculated by applying the `skew_ratio` as a
     * percentage of the cycle duration.
     * - Where `skew_ratio == 0.5`, color will be set to color for the first 50% of the cycle
     *   period, then to current color until the end of the cycle
     * - Where `skew_ratio == 0.25`, color will be set to color for the first 25% of the cycle
     *   period, then to current color until the end of the cycle
     */
    Pulse = 4,
}

/**
 * Sent by a client to obtain the light state.
 * No payload required.
 * Causes the device to transmit a `State` message.
 */
export function Get(): Buffer {
    return Message(LightMessage.Get);
}

/**
 * Sent by a client to change the light state.
 * The duration is the color transition time in milliseconds.
 * If the Frame Address res_required field is set to one (1) then the device will transmit a State message.
 */
export function SetColor(color: HSBK, duration: number = 0): Buffer {
    const payload = Buffer.allocUnsafe(13);
    // TODO: Write payload
    // NOTE: reserved, unsigned 8-bit integer
    // NOTE: color
    // NOTE: duration, unsigned 32-bit integer
    return Message(LightMessage.SetColor, payload);
}

/**
 * Apply an effect to the bulb.
 * This message will be replied to with a `State` message.
 *
 * @see Waveform
 *
 * @param transient Color does not persist.
 * @param color Light end color
 * @param period Duration of a cycle in milliseconds
 * @param cycles Number of cycles
 * @param skewRatio Waveform skew (between 0 and 1)
 * @param waveform Waveform to use for transition
 */
export function SetWaveform(
    transient: boolean,
    color: HSBK,
    period: number = 500,
    cycles: number = 1,
    skewRatio: number = 0.5,
    waveform: Waveform = Waveform.Saw
): Buffer {
    const payload = Buffer.allocUnsafe(0);
    // TODO: Write payload
    return Message(LightMessage.SetWaveform, payload);
}

/**
 * Optionally set effect parameters. Same as SetWaveform but allows some parameters to be set from
 * the current value on device.
 * This message will be replied to with a `State` message.
 *
 * @see Waveform
 *
 * @param transient Color does not persist.
 * @param color Light end color
 * @param period Duration of a cycle in milliseconds
 * @param cycles Number of cycles
 * @param skewRatio Waveform skew (between 0 and 1)
 * @param waveform Waveform to use for transition
 * @param setHue Set hue from current value on device
 * @param setSaturation Set saturation from current value on device
 * @param setBrightness Set brightness from current value on device
 * @param setKelvin Set kelvin from current value on device
 */
export function SetWaveformOptional(
    transient: boolean,
    color: HSBK,
    period: number = 500,
    cycles: number = 1,
    skewRatio: number = 0.5,
    waveform: Waveform = Waveform.Saw,
    setHue: boolean = false,
    setSaturation: boolean = false,
    setBrightness: boolean = false,
    setKelvin: boolean = false
): Buffer {
    const payload = Buffer.allocUnsafe(0);
    // TODO: Write payload
    return Message(LightMessage.SetWaveformOptional, payload);
}

/**
 * Sent by a client to obtain the power level.
 * No payload required.
 * Causes the device to transmit a `StatePower` message.
 */
export function GetPower(): Buffer {
    return Message(LightMessage.GetPower);
}

/**
 * Sent by a client to change the light power level.
 *
 * If the Frame Address `res_required` field is set to one (`1`) then the device will transmit a
 * `StatePower` message.
 *
 * @param power The power level can be either standby (`0`) or enabled (`65535`). Currently, only
 *              the values `0` and `65535` are supported
 * @param duration Power level transition time in milliseconds
 */
export function SetPower(power: number = 0, duration: number = 0): Buffer {
    const payload = Buffer.allocUnsafe(6);
    payload.writeUInt16LE(power, 0);
    payload.writeUInt32LE(duration, 2);
    return Message(LightMessage.SetPower, payload);
}

/**
 * Gets the current maximum power level of the Infrared channel.
 * If the Frame Address `res_required` field is set to one (`1`) then the device will transmit a
 * `StateInfrared` message.
 * No payload is required
 */
export function GetInfrared(): Buffer {
    return Message(LightMessage.GetInfrared);
}

/**
 * Send this message to alter the current maximum brightness for the infrared channel.
 * If the Frame Address `res_required` field is set to one (`1`) then the device will transmit a
 * `StateInfrared` message.
 */
export function SetInfrared(brightness: number): Buffer {
    const payload = Buffer.allocUnsafe(2);
    payload.writeUInt16LE(brightness, 0);
    return Message(LightMessage.SetInfrared, payload);
}
