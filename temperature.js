'use strict';

const ds18b20 = require('ds18b20');

const BME280 = require('./bme280');
const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

class Temperature {

    constructor(model, options = null) {

        this.model = model;
        if (this.model === 'DS18B20') {
            ds18b20.sensors( (error, ids) => {
                this.device = ids[0];
            });
        } else if(this.model === 'BME280') {
            this.bme280 = new BME280(options);
        }
        this.database = new Database('dust', 24 * 366);
        this.cache = new Cache(['last', 'mean']);

    }

    store() {

        if (this.model === 'DS18B20') {
            ds18b20.temperature(this.device, (error, value) => {
                if (error) {
                    console.error(error);
                } else {
                    this.cache.clean();
                    this.database.store({ 'temperature': { 'value': value, 'unit': '°C' },
                    'model': this.model, 'timestamp': Date.now() });
                }
            });    
        } else if(this.model === 'BME280') {
            this.bme280.temperature().then((data) => {
                this.cache.clean();
                this.database.store(data);
            }).catch((error) => {
                console.error(error);
            });
        }

    }

    info(requet, response) {

        this.database.records().then((records) => {
            response.json({ 'records': records });
        });
    
    }

    current(request, response) {

        if (this.model === 'DS18B20') {
            ds18b20.temperature(this.device, (err, value) => {
                if (err) {
                    console.error(err);
                    response.json('');
                } else {
                    response.json({ 'temperature': { 'value': value, 'unit': '°C' },
                    'model': this.model, 'timestamp': Date.now() });
                }
            });    
        } else if(this.model === 'BME280') {
            this.bme280.temperature().then((data) => {
                response.json(data);
            }).catch((err) => {
                console.error(err);
                response.json('');
            });
        }

    }

    last(request, response) {

        let result = this.cache.read('last', request.query);
        if (result !== null) {
            response.json(result);
        } else {
            result = [];
            this.database.find(this.cache.timestamp(request.query), (record) => {
                result.unshift(record);
            }).then(() => {
                if (result.length) {
                    this.cache.write('last', request.query, result);
                }
                response.json(result);
            }).catch((error) => {
                console.error(error);
                response.json('');
            });
        }

    }

    mean(request, response) {

        let result = this.cache.read('mean', request.query);
        if (result !== null) {
            response.json(result);
        } else {
            let divider = 0;
            this.database.find(this.cache.timestamp(request.query), (record) => {
                if (result === null) {
                    result = record;
                } else {
                    result.temperature.value += record.temperature.value;
                }
                divider++;
            }).then(() => {
                if (result !== undefined && result !== null && divider) {
                    result.temperature.value = round(result.temperature.value/divider, 1);
                    this.cache.write('mean', request.query, result);
                }
                response.json(result);
            }).catch((error) => {
                console.error(error);
                response.json('');
            });
        }

    }

    close() {
    
        return this.database.close();
    
    }

}

module.exports = Temperature;
