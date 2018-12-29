import { Message } from "./Message";

export enum DeviceMessage {
    GetService = 2,
    StateService = 3,
    GetHostInfo = 12,
    StateHostInfo = 13,
    GetHostFirmware = 14,
    StateHostFirmware = 15,
    GetWifiInfo = 16,
    StateWifiInfo = 17,
    GetWifiFirmware = 18,
    StateWifiFirmware = 19,
    GetPower = 20,
    SetPower = 21,
    StatePower = 22,
    GetLabel = 23,
    SetLabel = 24,
    StateLabel = 25,
    GetVersion = 32,
    StateVersion = 33,
    GetInfo = 34,
    StateInfo = 35,
    Acknowledgement = 45,
    GetLocation = 48,
    SetLocation = 49,
    StateLocation = 50,
    GetGroup = 51,
    SetGroup = 52,
    StateGroup = 53,
    EchoRequest = 58,
    EchoResponse = 59,
}

/**
 * Sent by a client to acquire responses from all devices on the local network.
 * No payload is required.
 * Causes the devices to transmit a `StateService` message.
 * When using this message the `Frame` tagged field must be set to one (1).
 */
export function GetService(): Buffer {
    return Message(DeviceMessage.GetService);
}

/**
 * Get Host MCU information.
 * No payload is required.
 * Causes the device to transmit a `StateHostInfo` message.
 */
export function GetHostInfo(): Buffer {
    return Message(DeviceMessage.GetHostInfo);
}

/**
 * Gets Host MCU firmware information.
 * No payload is required.
 * Causes the device to transmit a `StateHostFirmware` message.
 */
export function GetHostFirmware(): Buffer {
    return Message(DeviceMessage.GetHostFirmware);
}

/**
 * Get Wifi subsystem information.
 * No payload is required.
 * Causes the device to transmit a `StateWifiInfo` message.
 */
export function GetWifiInfo(): Buffer {
    return Message(DeviceMessage.GetWifiInfo);
}

/**
 * Get Wifi subsystem firmware.
 * No payload is required.
 * Causes the device to transmit a `StateWifiFirmware` message.
 */
export function GetWifiFirmware(): Buffer {
    return Message(DeviceMessage.GetWifiFirmware);
}

/**
 * Get device power level.
 * No payload is required.
 * Causes the device to transmit a `StatePower` message.
 */
export function GetPower(): Buffer {
    return Message(DeviceMessage.GetPower);
}

/**
 * Get device label.
 * No payload is required.
 * Causes the device to transmit a `StateLabel` message.
 */
export function GetLabel(): Buffer {
    return Message(DeviceMessage.GetLabel);
}

/**
 * Get the hardware version.
 * No payload is required.
 * Causes the device to transmit a `StateVersion` message.
 */
export function GetVersion(): Buffer {
    return Message(DeviceMessage.GetVersion);
}

/**
 * Get run-time information.
 * No payload is required.
 * Causes the device to transmit a `StateInfo` message.
 */
export function GetInfo(): Buffer {
    return Message(DeviceMessage.GetInfo);
}

/**
 * Ask the bulb to return its location information.
 * No payload is required.
 * Causes the device to transmit a `StateLocation` message.
 */
export function GetLocation(): Buffer {
    return Message(DeviceMessage.GetLocation);
}

/**
 * Set the device location.
 *
 * Applications wishing to change either the label or location attributes MUST set the `updated_at`
 * field to the current timestamp and send the message to all applicable devices that are currently
 * online. This is because when reading these values the applications will consider unique
 * `location` fields to be a location identifier, and the label on the bulb with the highest
 * `updated_at` field for that location will be used. Applications SHOULD attempt to correct any
 * `label`s that are out of date when found.
 *
 * It is recommended to set the `response_required` flag on the message header to speed up updating
 * the cloud account.
 *
 * When creating a new location generate the `location` field with random data.
 *
 *  - location: guid byte array, byte array 16 bytes
 *  - label: text label for location, string 32 bytes
 *  - updated_at: UTC timestamp of last label update in nanoseconds, unsigned 64 bits integer
 */
export function SetLocation(): Buffer {
    const payload = Buffer.allocUnsafe(56);
    // TODO: Write payload
    return Message(DeviceMessage.SetLocation, payload);
}

/**
 * Ask the bulb to return its group membership information.
 * No payload is required.
 * Causes the device to transmit a StateGroup message.
 */
export function GetGroup(): Buffer {
    return Message(DeviceMessage.GetGroup);
}

/**
 * Set the device group.
 * Applications wishing to change either the label or group attributes MUST set the `updated_at`
 * field to the current timestamp and send the message to all applicable devices that are currently
 * online. This is because when reading these values the applications will consider unique `group`
 * fields to be a group identifier, and the label on the bulb with the highest `updated_at` field
 * for that group will be used. Applications SHOULD attempt to correct any `label`s that are out of
 * date when found.
 *
 * It is recommended to set the `response_required` flag on the message header to speed up updating
 * the cloud account.
 *
 * When creating a new group generate the `group` field with random data.
 *
 *  - `group`: guid byte array, byte array 16 bytes
 *  - `label`: text label for location, string 32 bytes
 *  - `updated_at`: UTC timestamp of last label update in nanoseconds, unsigned 64 bits integer
 */
export function SetGroup(): Buffer {
    const payload = Buffer.allocUnsafe(56);
    // TODO: Write payload
    return Message(DeviceMessage.SetGroup, payload);
}

/**
 * Request an arbitrary payload be echoed back.
 * Causes the device to transmit an `EchoResponse` message.
 */
export function EchoRequest(payload: Buffer): Buffer {
    return Message(DeviceMessage.EchoRequest, payload);
}
