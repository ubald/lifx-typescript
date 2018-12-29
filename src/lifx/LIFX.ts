import * as dgram from "dgram";

import { Device } from "./Device";
import { Group } from "./Group";
import { HSBK } from "./HSBK";
import { DeviceMessage, GetGroup, GetLabel, GetService } from "./messages/DeviceMessages";
import { LightMessage } from "./messages/LightMessages";
import {
    FRAME_ADDRESS_SEQUENCE_OFFSET,
    FRAME_HEADER_MESSAGE_LENGTH_OFFSET,
    FRAME_HEADER_SOURCE_OFFSET,
    PAYLOAD_OFFSET,
    PROTOCOL_HEADER_TYPE_OFFSET,
} from "./messages/Message";
import { GetColorZones, MultiZoneMessage } from "./messages/MultiZoneMessages";
import { MessageUtil } from "./utils/MessageUtil";

enum Service {
    UDP = 1,
}

export class LIFX {
    public static readonly PORT = 56700;
    private static readonly CLIENT_ID = 420;

    private socket: dgram.Socket;
    private sequence: number = 0;
    private devices: Map<string, Device> = new Map();
    private groups: Map<Buffer, Group> = new Map();

    public constructor(public readonly clientId: number = LIFX.CLIENT_ID) {
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

        this.socket.bind(LIFX.PORT);
    }

    /**
     * Discover devices on the local network
     */
    public discover(): void {
        this.send(GetService());
    }

    /**
     * Send a framed message, will set the source and sequence and handle errors.
     */
    public send(message: Buffer, address: string = "255.255.255.255", port: number = LIFX.PORT): void {
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
        switch (type) {
            case DeviceMessage.StateService: {
                const service = message.readUInt8(PAYLOAD_OFFSET);
                if (service !== Service.UDP) {
                    // console.log("Unsupported service", service);
                    break;
                }
                const requestedPort = message.readUInt32LE(PAYLOAD_OFFSET + 1);

                const device = this.getOrCreateDevice(address);
                device.port = requestedPort;

                // Request more information from the device
                this.send(GetLabel(), device.address, device.port);
                this.send(GetGroup(), device.address, device.port);
                this.send(GetColorZones(), device.address, device.port);

                console.log(`${address} > StateService(service=${service}, port=${requestedPort})`);
                break;
            }

            case DeviceMessage.StateLabel: {
                const label = MessageUtil.readString(message, PAYLOAD_OFFSET, 32);

                const device = this.getOrCreateDevice(address);
                device.label = label;

                console.log(`${address} > StateLabel(label=${label})`);
                break;
            }

            case DeviceMessage.StateGroup: {
                const groupId = Buffer.allocUnsafe(16);
                message.copy(groupId, 0, PAYLOAD_OFFSET, PAYLOAD_OFFSET + 16);

                const label = MessageUtil.readString(message, PAYLOAD_OFFSET + 16, 32);

                // NOTE: Skipping 64 bits unsigned integer updatedAt, timestamp in nanoseconds

                const group = this.getOrCreateGroup(groupId);
                group.label = label;

                const device = this.getOrCreateDevice(address);
                device.group = group;

                console.log(`${address} > StateGroup(group=Buffer, label=${label})`, groupId);
                break;
            }

            case LightMessage.State: {
                const color = MessageUtil.readColor(message, PAYLOAD_OFFSET);
                // NOTE: reserved, 16 bits
                const power = message.readUInt16LE(PAYLOAD_OFFSET + 10);
                const label = MessageUtil.readString(message, PAYLOAD_OFFSET + 12, 32);
                // NOTE: reserved: 64 bits

                console.log(`${address} > State:`, {
                    label,
                    color,
                    power,
                });
                break;
            }

            case MultiZoneMessage.StateZone: {
                const count = message.readUInt8(PAYLOAD_OFFSET);
                const index = message.readUInt8(PAYLOAD_OFFSET + 1);
                const color = MessageUtil.readColor(message, PAYLOAD_OFFSET + 2);

                const device = this.getOrCreateDevice(address);
                const zone = device.getOrCreateZone(index, count);

                console.log(`${address} > StateZone:`, {
                    count,
                    index,
                    color,
                });
                break;
            }

            case MultiZoneMessage.StateMultiZone: {
                const count = message.readUInt8(PAYLOAD_OFFSET);
                const index = message.readUInt8(PAYLOAD_OFFSET + 1);

                const colorsOffset = PAYLOAD_OFFSET + 2;
                const maxColorReadCount = Math.min(8, count - index);
                const colors = new Array<HSBK>(maxColorReadCount);
                for (let i = 0; i < maxColorReadCount; ++i) {
                    colors[i] = MessageUtil.readColor(message, colorsOffset + i * 8);
                }

                console.log(`${address} > StateMultiZone:`, {
                    count,
                    index,
                    colors,
                });
                break;
            }

            default:
                console.log("Unsupported message type", type);
                break;
        }
    }

    private getOrCreateDevice(address: string): Device {
        let device = this.devices.get(address);
        if (!device) {
            device = new Device(address);
            this.devices.set(address, device);
        }
        return device;
    }

    private getOrCreateGroup(id: Buffer): Group {
        let group = this.groups.get(id);
        if (!group) {
            group = new Group(id);
            this.groups.set(id, group);
        }
        return group;
    }
}
