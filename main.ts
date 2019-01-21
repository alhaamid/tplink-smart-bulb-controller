// https://github.com/plasticrake/tplink-smarthome-api/blob/master/API.md
// https://www.npmjs.com/package/tplink-smarthome-api
import { Client } from 'tplink-smarthome-api';
// import fs from 'fs';
// import mic from 'mic';

const TRANSITION_PERIOD: number = 10;
var MODE: string = "disco";
var START_COLOR = {hue: 0, saturation: 100, brightness: 100, transition_period: TRANSITION_PERIOD};

const client = new Client();
client.startDiscovery().on('device-new', (bulb) => {
    bulb.getSysInfo().then(info => {
        if (info.alias == "Bedroom Light") {
            bulb.setPowerState(true);
            // bulb.lighting.setLightState(START_COLOR)
            // .then(done => { setTimeout(() => {startChangingColors(bulb);}, TRANSITION_PERIOD) })
            // .catch(err => { setTimeout(() => {startChangingColors(bulb);}, TRANSITION_PERIOD) });
            startChangingColors(bulb)
        }
    });
});

function print(...args) {
    console.log(...args);
}

function updateHue(hue: number) {
    var new_hue: number = hue;
    if (MODE == "disco") {
        new_hue += 70;
    } else if (MODE == "gradual") {
        new_hue += 10;
    } else {
        print("unknown mode");
    }
    return hueLoopCorrection(new_hue);
}

function hueLoopCorrection(hue: number) {
    if (hue >= 360) {
        return hueLoopCorrection(hue - 360);
    } else {
        return hue;
    }
}

function startChangingColors(bulb) {
    bulb.lighting.getLightState()
    .then(state => {
        var current_color_scheme = {
            hue: state.hue, 
            saturation: state.saturation, 
            brightness: state.brightness
        };
        
        var next_hue = updateHue(current_color_scheme.hue);

        var next_color_scheme = {
            hue: next_hue, 
            saturation: 100, 
            brightness: 100, 
            transition_period: TRANSITION_PERIOD
        };
        
        print("changing color of", bulb.alias, "to", next_color_scheme.hue);
        bulb.lighting.setLightState(next_color_scheme)
        .then(done => { setTimeout(() => {startChangingColors(bulb);}, TRANSITION_PERIOD) })
        .catch(err => { setTimeout(() => {startChangingColors(bulb);}, TRANSITION_PERIOD) });
    })
}