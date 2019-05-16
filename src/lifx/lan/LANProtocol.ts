import * as dgram from "dgram";

import {
    FRAME_ADDRESS_SEQUENCE_OFFSET,
    FRAME_HEADER_MESSAGE_LENGTH_OFFSET,
    FRAME_HEADER_SOURCE_OFFSET,
    MessageParser,
    PROTOCOL_HEADER_TYPE_OFFSET,
} from "./messages/Message";

export class LANProtocol {
    public static readonly PORT = 56700;
    private static readonly CLIENT_ID = 0;
    private static parsers: Map<number, MessageParser> = new Map();

    public static addParser(type: number, handler: MessageParser): void {
        if (LANProtocol.parsers.has(type)) {
            throw new Error(`Parser for type ${type} is was already added.`);
        }
        LANProtocol.parsers.set(type, handler);
    }

    private readonly clientId: number;
    private readonly socket: dgram.Socket;
    private sequence: number = 0;

    public constructor({ clientId }: { clientId: number } = { clientId: LANProtocol.CLIENT_ID }) {
        this.clientId = clientId || LANProtocol.CLIENT_ID;
        this.socket = dgram.createSocket("udp4");

        this.socket.on("error", error => {
            console.error(`Socket error`, error);
            this.socket.close();
        });

        this.socket.on("message", (message, rinfo) => {
            console.log(`${rinfo.address}:${rinfo.port}`, message);
            this.onMessage(message, rinfo.address, rinfo.port);
        });

        this.socket.on("listening", () => {
            this.socket.setBroadcast(true);

            const address = this.socket.address();
            if (typeof address === "string") {
                console.log(`Server listening on ${address}`);
            } else {
                console.log(`Server listening on ${address.address}:${address.port}`);
            }
        });

        this.socket.bind(LANProtocol.PORT);
    }

    /**
     * Send a framed message, will set the source and sequence and handle errors.
     */
    public send(message: Buffer, address: string = "255.255.255.255", port: number = LANProtocol.PORT): void {
        message.writeUInt32LE(this.clientId, FRAME_HEADER_SOURCE_OFFSET);
        message.writeUInt8(this.sequence++ % 256, FRAME_ADDRESS_SEQUENCE_OFFSET);

        console.log(`Sending:`, message);
        this.socket.send(message, 0, message.length, port, address, (error, bytes) => {
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * Message Handler
     */
    private onMessage(message: Buffer, address: string, port: number): void {
        const length = message.readInt16LE(FRAME_HEADER_MESSAGE_LENGTH_OFFSET);
        if (length !== message.length) {
            console.log(`Buffer length doesn't match header's. Buffer: ${message.length}, header: ${length}`);
            return;
        }

        const source = message.readUInt32LE(FRAME_HEADER_SOURCE_OFFSET);
        if (source !== this.clientId) {
            console.log(`Message source (${source}) doesn't match our clientId (${this.clientId})`);
        }

        const type = message.readUInt16LE(PROTOCOL_HEADER_TYPE_OFFSET);
        const parser = LANProtocol.parsers.get(type);
        if (parser) {
            parser(this, message);
        } else {
            console.log("Unsupported message type:", type);
        }
    }
}
