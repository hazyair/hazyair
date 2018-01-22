'use strict';

const BME280Sensor = require('bme280-sensor');

let init = false;

const BME280 = function(options) {

//TODO Return promise
    this.bme280 = new BME280Sensor(options);
    if (init === false) {
        this.bme280.init().then((data) => {
            init = true;
        }).catch((error) => {
            console.error(error);
        });
    }

};


BME280.prototype.temperature = function() {

    return new Promise((resolve, reject) => {
        this.bme280.readSensorData().then((data) => {
            return resolve({ 'temperature': { 'value': data.temperature_C, 'unit': '°C'},
            'model': 'BME280', 'timestamp': Date.now() });
        }).catch((error) => {
            return reject(error);  
        });
    });

};

BME280.prototype.pressure = function() {

    return new Promise((resolve, reject) => {
        this.bme280.init().then((data) => {
            return resolve({ 'pressure': { 'value': data.pressure_hPa, 'unit': 'hPa' },
            'model': 'BME280', 'timestamp': Date.now() });
        }).catch((error) => {
            return reject(error);  
        });
    });

};


BME280.prototype.humidity = function() {

    return new Promise((resolve, reject) => {
        this.bme280.init().then((data) => {
            return resolve({ 'humidity': { 'value': data.humidity, 'unit': '%' },
            'model': 'BME280', 'timestamp': Date.now() });
        }).catch((error) => {
            return reject(error);  
        });
    });

};

module.exports = BME280;
