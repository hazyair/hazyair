'use strict';

const Plantower = require('plantower');

const Database = require('./database');
const Cache = require('./cache');

let Api = function(model, dev) {

    this.plantower = new Plantower(model, dev);
    this.database = new Database(24 * 366);
    this.cache = new Cache(['last', 'average']);

};

Api.prototype.store = function() {

    this.plantower.read().then((data) => {
        this.cache.clean();
        this.database.store(data);
    }).catch((err) => {
        console.error(err);
    });

};

Api.prototype.info = function (req, res) {

    res.json(this.database.records());

};

Api.prototype.current = function (req, res) {

    this.plantower.read().then((data) => {
        res.json(data);
    }).catch((err) => {
        console.error(err);
        res.json('');
    });

};

Api.prototype.last  = function(req, res) {

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

Api.prototype.average = function(req, res) {

    let response = this.cache.read('average', req.query);
    if (response === null) {
        let divider = 0;
        this.database.find(this.cache.timestamp(req.query), (record) => {
            if (response === null) {
                response = record;
            } else {
                response['concentration_pm1.0_normal'].value += record['concentration_pm1.0_normal'].value;
                response['concentration_pm2.5_normal'].value += record['concentration_pm2.5_normal'].value;
                response.concentration_pm10_normal.value += record.concentration_pm10_normal.value;
                response['concentration_pm1.0_atmos'].value += record['concentration_pm1.0_atmos'].value;
                response['concentration_pm2.5_atmos'].value += record['concentration_pm2.5_atmos'].value;
                response.concentration_pm10_atmos.value += record.concentration_pm10_atmos.value;
                response['count_pm_0.3'].value += record['count_pm_0.3'].value;
                response['count_pm_0.5'].value += record['count_pm_0.5'].value;
                response['count_pm_1.0'].value += record['count_pm_1.0'].value;
                response['count_pm_2.5'].value += record['count_pm_2.5'].value;
                response.count_pm_5.value += record.count_pm_5.value;
                response.count_pm_10.value += record.count_pm_10.value;
            }
            divider++;
        });
        if (response !== undefined && divider) {
            response['concentration_pm1.0_normal'].value = Math.round(response['concentration_pm1.0_normal'].value/divider);
            response['concentration_pm2.5_normal'].value = Math.round(response['concentration_pm2.5_normal'].value/divider);
            response.concentration_pm10_normal.value = Math.round(response.concentration_pm10_normal.value/divider);
            response['concentration_pm1.0_atmos'].value = Math.round(response['concentration_pm1.0_atmos'].value/divider);
            response['concentration_pm2.5_atmos'].value = Math.round(response['concentration_pm2.5_atmos'].value/divider);
            response.concentration_pm10_atmos.value = Math.round(response.concentration_pm10_atmos.value/divider);
            response['count_pm_0.3'].value = Math.round(response['count_pm_0.3'].value/divider);
            response['count_pm_0.5'].value = Math.round(response['count_pm_0.5'].value/divider);
            response['count_pm_1.0'].value = Math.round(response['count_pm_1.0'].value/divider);
            response['count_pm_2.5'].value = Math.round(response['count_pm_2.5'].value/divider);
            response.count_pm_5.value = Math.round(response.count_pm_5.value/divider);
            response.count_pm_10.value = Math.round(response.count_pm_10.value/divider);
            this.cache.write('average', req.query, response);
        }
    }
    res.json(response);

};

Api.prototype.close  = function() {

    this.database.close();

};

module.exports = Api;
