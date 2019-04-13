'use strict';

const PMS = require('hazyair-plantower');

let sensor = {};

class Plantower {

    constructor(model, options = { device: '/dev/serial0' }) {

        if(!sensor.hasOwnProperty(model)) {
            sensor[model] = new PMS(model, options.device);
        }
        this.sensor = sensor[model];

    }

    dust() {

        return new Promise((resolve, reject) => {

            this.sensor.read().then((data) => {
                return resolve(data);
            }).catch((error) => {
                return reject(error);
            });

        });

    }
}

module.exports = Plantower;
