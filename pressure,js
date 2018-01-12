'use strict';

const BME280 = require('./bme280');
const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

let Pressure = function(model, options = null) {
    
    this.model = model;
    if(this.model === 'BME280') {
        this.bme280 = new BME280(options);
    }
    this.database = new Database('pressure', 24 * 366);
    this.cache = new Cache(['last', 'mean']);

};

Pressure.prototype.store = function() {
    
    if(this.model === 'BME280') {
        this.bme280.pressure().then((data) => {
            this.cache.clean();
            this.database.store(data);
        }).catch((err) => {
            console.error(err);
        });
    }
    
};

Pressure.prototype.info = function(req, res) {
    
    res.json(this.database.records());

};

Pressure.prototype.current = function(req, res) {
    
    if(this.model === 'BME280') {
        this.bme280.pressure().then((data) => {
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.json('');
        });
    }

};

Pressure.prototype.last = function(req, res) {
    
    let response = this.cache.read('last', req.query);
    if (response === null) {
        response = [];
        this.database.find(this.cache.timestamp(req.query), (record) => {
            response.unshift(record);
        });
        if (response.length) {
            this.cache.write('last', req.query, response);
        }
    }
    res.json(response);

};

Pressure.prototype.mean = function(req, res) {

    let response = this.cache.read('mean', req.query);
    if (response === null) {
        let divider = 0;
        this.database.find(this.cache.timestamp(req.query), (record) => {
            if (response === null) {
                response = record;
            } else {
                response.pressure.value += record.pressure.value;
            }
            divider++;
        });
        if (response !== undefined && response !== null && divider) {
            response.pressure.value = round(response.pressure.value/divider);
            this.cache.write('mean', req.query, response);
        }
    }
    res.json(response);
    
};

Pressure.prototype.close = function(req, res) {
    
    this.database.close();

};

module.exports = Pressure;
