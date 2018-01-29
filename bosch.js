'use strict';

const BME280Sensor = require('bme280-sensor');
const round = require('./round');

let bmx280 = null;

class Bosch {
    
    constructor(model, options) {

        if (!bmx280) {
            bmx280 = new BME280Sensor(options);
            bmx280.model = model;
            bmx280.init();
        }

    }

    temperature() {

        return new Promise((resolve, reject) => {
            
            bmx280.readSensorData().then((data) => {
                return resolve({ 'temperature': { 'value': round(data.temperature_C,1), 'unit': '°C'},
                'model': bmx280.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
            
        });

    }

    pressure() {

        return new Promise((resolve, reject) => {
            
            bmx280.readSensorData().then((data) => {
                return resolve({ 'pressure': { 'value': round(data.pressure_hPa), 'unit': 'hPa' },
                'model': bmx280.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
            
        });

    }


    humidity() {

        return new Promise((resolve, reject) => {
            
            bmx280.readSensorData().then((data) => {
                return resolve({ 'humidity': { 'value': round(data.humidity), 'unit': '%' },
                'model': bmx280.model, 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
            
        });

    }
}

module.exports = Bosch;
