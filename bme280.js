'use strict';

const BME280Sensor = require('bme280-sensor');
const round = require('./round');

let bme280 = null;

class BME280 {
    
    constructor(options) {

        if (!bme280) {
            console.log("BME280");
            bme280 = new BME280Sensor(options);
            bme280.init();
        }

    }


    temperature() {

        return new Promise((resolve, reject) => {
            
            bme280.readSensorData().then((data) => {
                return resolve({ 'temperature': { 'value': round(data.temperature_C,1), 'unit': '°C'},
                'model': 'BME280', 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
        });

    }

    pressure() {

        return new Promise((resolve, reject) => {
            bme280.readSensorData().then((data) => {
                return resolve({ 'pressure': { 'value': round(data.pressure_hPa), 'unit': 'hPa' },
                'model': 'BME280', 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
        });

    }


    humidity() {

        return new Promise((resolve, reject) => {
            bme280.readSensorData().then((data) => {
                return resolve({ 'humidity': { 'value': round(data.humidity), 'unit': '%' },
                'model': 'BME280', 'timestamp': Date.now() });
            }).catch((error) => {
                return reject(error);  
            });
        });

    }
}

module.exports = BME280;
