'use strict';

const miio = require('miio');

class Xiaomi {

    constructor(model, options = { device: '192.168.0.1' }) {

        this.model = model;
        this.address = options.device;

    }

    dust() {

        return new Promise((resolve, reject) => {
            
            miio.device({ address: this.address }).then((device) => {
                var value = device.property('aqi');
                if (value === undefined || value === null) value = 0;
                return resolve({ 'concentration_pm2.5_normal': { 'value': value, 'unit': 'µg/m^3' },
                'model': this.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);
            });

        });

    }

    temperature() {

        return new Promise((resolve, reject) => {

            miio.device({ address: this.address }).then((device) => {
                var value = device.property('temperature');
                if (value === undefined || value === null) value = 0;
                return resolve({ 'temperature': { 'value': value, 'unit': '°C' },
                'model': this.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);
            });

        });

    }

    humidity() {

        return new Promise((resolve, reject) => {

            miio.device({ address: this.address }).then((device) => {
                var value = device.property('temperature');
                if (value === undefined || value === null) value = 0;
                return resolve({ 'humidity': { 'value': value, 'unit': '%' }, 'model': this.model,
                'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);
            });

        });

    }

}

module.exports = Xiaomi;
