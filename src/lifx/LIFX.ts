import { Device } from "./Device";
import { Group } from "./Group";
import { LANProtocol } from "./lan/LANProtocol";
import { DeviceMessage, GetService } from "./lan/messages/DeviceMessages";

type MessageHandler = (lifx: LIFX, message: any, address: string, port: number) => void;

interface

export class LIFX {
    private static handlers: Map<number, MessageHandler> = new Map();

    public static addHandler(type: number, handler: MessageHandler): void {
        if (LIFX.handlers.has(type)) {
            throw new Error(`Handler for type ${type} is was already added.`);
        }
        LIFX.handlers.set(type, handler);
    }

    public readonly lan: LANProtocol;
    private readonly devices: Map<string, Device> = new Map();
    private readonly groups: Map<Buffer, Group> = new Map();

    constructor({ autoDiscover }: { autoDiscover: boolean } = { autoDiscover: true }) {
        this.lan = new LANProtocol();
    }

    /**
     * Discover devices on the local network
     */
    public discover(): void {
        this.lan.send(GetService());
    }

    public getOrCreateDevice(address: string): Device {
        let device = this.devices.get(address);
        if (!device) {
            device = new Device(address);
            this.devices.set(address, device);
        }
        return device;
    }

    public getOrCreateGroup(id: Buffer): Group {
        let group = this.groups.get(id);
        if (!group) {
            group = new Group(id);
            this.groups.set(id, group);
        }
        return group;
    }
}

LIFX.addHandler(DeviceMessage.StateService, (lifx, serviceState) => {
    // Request more information from the device
    // lifx.lan.send(GetLabel(), device.address, device.port);
    // lifx.lan.send(GetGroup(), device.address, device.port);
    // lifx.lan.send(GetColorZones(), device.address, device.port);
});
