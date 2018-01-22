'use strict';

const ds18b20 = require('ds18b20');

const BME280 = require('./bme280');
const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

let Temperature = function(model, options = null) {

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

};

Temperature.prototype.store = function() {

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

};

Temperature.prototype.info = function(requet, response) {

	this.database.records().then((records) => {
		response.json({ 'records': records });
	});
    
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

Temperature.prototype.last = function(request, response) {

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

};

Temperature.prototype.mean = function(request, response) {

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

};

Temperature.prototype.close = function() {
    
    return this.database.close();
    
};

module.exports = Temperature;
