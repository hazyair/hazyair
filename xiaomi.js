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
               return resolve({ 'concentration_pm2.5_normal': { 'value': device.property('aqi'), 'unit': 'µg/m^3' },
               'model': this.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);
            });

        });

    }

    temperature() {

        return new Promise((resolve, reject) => {

            miio.device({ address: this.address }).then((device) => {
               return resolve({ 'temperature': { 'value': device.property('temperature'), 'unit': '°C' },
               'model': this.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);
            });

        });

    }

    humidity() {

        return new Promise((resolve, reject) => {

            miio.device({ address: this.address }).then((device) => {
               return resolve({ 'humidity': { 'value': device.property('humidity'), 'unit': '%' }, 'model': this.model,
               'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);
            });

        });

    }
    
}

module.exports = Xiaomi;
