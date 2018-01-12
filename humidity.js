'use strict';

const BME280 = require('./bme280');
const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

let Humidity = function(model, options = null) {

    this.model = model;
    if(this.model === 'BME280') {
        this.bme280 = new BME280(options);
    }
    this.database = new Database('humidity', 24 * 366);
    this.cache = new Cache(['last', 'mean']);
    
};

Humidity.prototype.store = function() {
    
    if(this.model === 'BME280') {
        this.bme280.humidity().then((data) => {
            this.cache.clean();
            this.database.store(data);
        }).catch((err) => {
            console.error(err);
        });
    }
    
};

Humidity.prototype.info = function(req, res) {
    
    res.json(this.database.records());

};

Humidity.prototype.current = function(req, res) {

    if(this.model === 'BME280') {
        this.bme280.humidity().then((data) => {
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.json('');
        });
    }

};

Humidity.prototype.last = function(req, res) {
 
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

Humidity.prototype.mean = function(req, res) {

    let response = this.cache.read('mean', req.query);
    if (response === null) {
        let divider = 0;
        this.database.find(this.cache.timestamp(req.query), (record) => {
            if (response === null) {
                response = record;
            } else {
                response.humidity.value += record.humidity.value;
            }
            divider++;
        });
        if (response !== undefined && response !== null && divider) {
            response.humidity.value = round(response.humidity.value/divider);
            this.cache.write('mean', req.query, response);
        }
    }
    res.json(response);    

};

Humidity.prototype.close = function(req, res) {
    
    this.database.close();

};

module.exports = Humidity;
