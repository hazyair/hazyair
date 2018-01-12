'use strict';

const ds18b20 = require('ds18b20');

const BME280 = require('./bme280');
const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

let Temperature = function(model, options = null) {

    this.model = model;
    if (this.model === 'DS18B20') {
        ds18b20.sensors( (err, ids) => {
           this.device = ids[0];
        });
    } else if(this.model === 'BME280') {
        this.bme280 = new BME280(options);
    }
    this.database = new Database('dust', 24 * 366);
    this.cache = new Cache(['last', 'mean']);

};

Temperature.prototype.store = function() {

    if (this.model === 'DS18B20') {
        ds18b20.temperature(this.device, (err, value) => {
            if (err) {
                console.error(err);
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
        }).catch((err) => {
            console.error(err);
        });
    }

};

Temperature.prototype.info = function(req, res) {

    res.json(this.database.records());
    
};

Temperature.prototype.current = function(req, res) {

    if (this.model === 'DS18B20') {
        ds18b20.temperature(this.device, (err, value) => {
            if (err) {
                console.error(err);
                res.json('');
            } else {
                res.json({ 'temperature': { 'value': value, 'unit': '°C' },
                'model': this.model, 'timestamp': Date.now() });
            }
        });    
    } else if(this.model === 'BME280') {
        this.bme280.temperature().then((data) => {
            res.json(data);
        }).catch((err) => {
            console.error(err);
            res.json('');
        });
    }

};

Temperature.prototype.last = function(req, res) {

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

Temperature.prototype.mean = function(req, res) {

    let response = this.cache.read('mean', req.query);
    if (response === null) {
        let divider = 0;
        this.database.find(this.cache.timestamp(req.query), (record) => {
            if (response === null) {
                response = record;
            } else {
                response.temperature.value += record.temperature.value;
            }
            divider++;
        });
        if (response !== undefined && response !== null && divider) {
            response.temperature.value = round(response.temperature.value/divider, 1);
            this.cache.write('mean', req.query, response);
        }
    }
    res.json(response);

};

Temperature.prototype.close = function() {
    
    this.database.close();
    
};

module.exports = Temperature;
