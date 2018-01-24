'use strict';

const BME280 = require('./bme280');
const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

class Pressure {

    constructor(model, options = null) {
    
        this.model = model;
        if(this.model === 'BME280') {
            this.bme280 = new BME280(options);
        }
        this.database = new Database('pressure', 24 * 366);
        this.cache = new Cache(['last', 'mean']);

    }

    store() {
    
        if(this.model === 'BME280') {
            this.bme280.pressure().then((data) => {
                this.cache.clean();
                this.database.store(data);
            }).catch((err) => {
                console.error(err);
            });
        }
    
    }

    info(request, response) {
    
        response.json(this.database.records());

    }

    current(request, response) {
    
        if(this.model === 'BME280') {
            this.bme280.pressure().then((data) => {
                response.json(data);
            }).catch((err) => {
                console.log(err);
                response.json('');
            });
        }

    }

    last(request, response) {
    
        let result = this.cache.read('last', request.query);
        if (result === null) {
            response.json(result);    
        } else {
            result = [];
            this.database.find(Cache.timestamp(request.query), (record) => {
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
            this.database.find(Cache.timestamp(request.query), (record) => {
                if (result === null) {
                    result = record;
                } else {
                    result.pressure.value += record.pressure.value;
                }
                divider++;
            }).then(() => {
                if (result !== undefined && result !== null && divider) {
                    result.pressure.value = round(result.pressure.value/divider);
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

module.exports = Pressure;
