'use strict';

const BME280Sensor = require('bme280-sensor');
const round = require('./round');

let sensor = {};

class Bosch {
    
    constructor(model, options) {

        if (!sensor.hasOwnProperty(model)) {
            sensor[model] = new BME280Sensor(options);
            sensor[model].init();
        }
        this.sensor = sensor[model];
        this.sensor.model = model;
    }

    temperature() {

        return new Promise((resolve, reject) => {
            
            this.sensor.readSensorData().then((data) => {
                return resolve({ 'temperature': { 'value': round(data.temperature_C,1), 'unit': '°C'},
                'model': this.sensor.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
            
        });

    }

    pressure() {

        return new Promise((resolve, reject) => {
            
            this.sensor.readSensorData().then((data) => {
                return resolve({ 'pressure': { 'value': round(data.pressure_hPa), 'unit': 'hPa' },
                'model': this.sensor.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
            
        });

    }


    humidity() {

        return new Promise((resolve, reject) => {
            
            this.sensor.readSensorData().then((data) => {
                return resolve({ 'humidity': { 'value': round(data.humidity), 'unit': '%' },
                'model': this.sensor.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
            
        });

    }
}

module.exports = Bosch;
