import "source-map-support/register";
import { LIFX } from "./lifx/LIFX";

const lifx = new LIFX();
lifx.discover();
// lifx.send(SetColorZones());

// let counter = 0;
// let direction = 1;
// setInterval(() => {
//     console.log(counter);
//     lifx.send(
//         SetColorZones(
//             0,
//             255,
//             { hue: 0, saturation: 0x3333, brightness: 0xffff, kelvin: counter },
//             0,
//             ApplicationRequest.Apply
//         )
//     );
//     counter += 10;
//     counter = counter % 0xffff;
// }, 1000 / 60);
