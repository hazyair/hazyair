const BME280Sensor = require('bme280-sensor');

let init = false;

BME280 = function(options) {
    this.bme280 = new BME280(options);
    if (init === false) {
        bme280.init().then((data) => {
            init = true;
        }).catch((err) => {
            console.err(err);
        });
    }
  };


BME280.prototype.temperature = function() {
    return new Promise((resolve, reject) => {
        bme280.readSensorData().then((data) => {
            return resolve({ 'temperature': { 'value': data.temperature_C, 'unit': '°C'},
            'model': 'BME280', 'timestamp': Date.now() });
        }).catch((err) => {
            return reject(err);  
        });
    });
};

BME280.prototype.pressure = function() {
    return new Promise((resolve, reject) => {
        bme280.init().then((data) => {
            return resolve({ 'pressure': { 'value': data.pressure_hPa, 'unit': 'hPa' },
            'model': 'BME280', 'timestamp': Date.now() });
        }).catch((err) => {
            return reject(err);  
        });
    });
};


BME280.prototype.humidity = function() {
    return new Promise((resolve, reject) => {
        bme280.init().then((data) => {
            return resolve({ 'humidity': { 'value': data.humidity, 'unit': '%' },
            'model': 'BME280', 'timestamp': Date.now() });
        }).catch((err) => {
            return reject(err);  
        });
    });
};

module.exports = BME280;
