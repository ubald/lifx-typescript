export const HEADER_LENGTH = 36;
export const FRAME_HEADER_MESSAGE_LENGTH_OFFSET = 0;
export const FRAME_HEADER_FRAME_OFFSET = 2;
export const FRAME_HEADER_SOURCE_OFFSET = 4;
export const FRAME_ADDRESS_TARGET_OFFSET = 8;
export const FRAME_ADDRESS_RESERVED_OFFSET = 16;
export const FRAME_ADDRESS_CONFIG_OFFSET = 22;
export const FRAME_ADDRESS_SEQUENCE_OFFSET = 23;
export const PROTOCOL_HEADER_RESERVED_LEADER_OFFSET = 24;
export const PROTOCOL_HEADER_TYPE_OFFSET = 32;
export const PROTOCOL_HEADER_RESERVED_TRAILER_OFFSET = 34;
export const PAYLOAD_OFFSET = HEADER_LENGTH;

export type MessageParser = (message: Buffer) => void;

export function Message(type: number, payload?: Buffer): Buffer {
    const messageLength = HEADER_LENGTH + (payload ? payload.length : 0);

    const message = Buffer.allocUnsafe(messageLength);

    /** Frame */

    // size: 16 bits, size of entire message
    message.writeUInt16LE(messageLength, FRAME_HEADER_MESSAGE_LENGTH_OFFSET);

    const origin = 0; // origin: 2 bits, must be zero
    const tagged = false; // tagged, 1 bit, uses frame address target field
    const addressable = true; // addressable, 1 bit, includes a target address, must be 1
    const protocol = 1024; // protocol, 12 bits, must be 1024
    message.writeUInt16LE(
        (origin << 14) | ((tagged ? 1 : 0) << 13) | ((addressable ? 1 : 0) << 12) | protocol,
        FRAME_HEADER_FRAME_OFFSET
    );
    // message.writeUInt16LE(0b0011010000000000, FRAME_HEADER_FRAME_OFFSET);

    // source, 32 bits, source identifier, unique client identifier
    message.writeUInt32LE(0x00000000, FRAME_HEADER_SOURCE_OFFSET);

    /** Frame Address */

    // target, 64 bits, 6 byte device MAC address or 0 for all
    message.writeUInt32LE(0x00000000, FRAME_ADDRESS_TARGET_OFFSET);
    message.writeUInt32LE(0x00000000, FRAME_ADDRESS_TARGET_OFFSET + 4);

    // reserved, 48 bits
    message.fill(0x00, FRAME_ADDRESS_RESERVED_OFFSET, FRAME_ADDRESS_RESERVED_OFFSET + 6);

    // reserved, 6 bits
    const ackRequired = false; // ack_required, 1 bit
    const resRequired = false; // res_required, 1 bit
    message.writeUInt8(((ackRequired ? 1 : 0) << 1) | (resRequired ? 1 : 0), FRAME_ADDRESS_CONFIG_OFFSET);

    // sequence, 8 bits
    message.writeUInt8(0x00, FRAME_ADDRESS_SEQUENCE_OFFSET);

    /** Protocol Header */

    // reserved, 64 bits
    message.writeUInt32LE(0x00000000, PROTOCOL_HEADER_RESERVED_LEADER_OFFSET);
    message.writeUInt32LE(0x00000000, PROTOCOL_HEADER_RESERVED_LEADER_OFFSET + 4);

    // type, 16 bits, message type
    message.writeUInt16LE(type, PROTOCOL_HEADER_TYPE_OFFSET);

    // reserved, 16 bits
    message.writeUInt16LE(0x0000, PROTOCOL_HEADER_RESERVED_TRAILER_OFFSET);

    /** Payload */

    if (payload) {
        payload.copy(message, PAYLOAD_OFFSET);
    }

    return message;
}
