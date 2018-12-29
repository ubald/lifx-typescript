import { Group } from "./Group";
import { LIFX } from "./LIFX";
import { Zone } from "./Zone";

export class Device {
    public port: number;
    public label: string | undefined;
    public group: Group | undefined;
    public zones: Array<Zone> = [];

    public constructor(public readonly address: string, port?: number, label?: string) {
        this.port = port || LIFX.PORT;
        this.label = label;
    }

    public getOrCreateZone(index: number, count: number): Zone {
        if (index >= count) {
            throw Error("Zone index outside bounds.");
        }

        while (this.zones.length < count) {
            this.zones.push(new Zone());
        }

        return this.zones[index];
    }
}
