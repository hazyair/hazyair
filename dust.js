'use strict';

const Plantower = require('plantower');

const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

let Dust = function(model, device) {

    this.plantower = new Plantower(model, device);
    this.database = new Database('dust', 24 * 366);
    this.cache = new Cache(['last', 'mean']);

};

Dust.prototype.store = function() {

    this.plantower.read().then((data) => {
        this.cache.clean();
        this.database.store(data);
    }).catch((error) => {
        console.error(error);
    });

};

Dust.prototype.info = function (request, response) {

    this.database.records().then((records) => {
        response.json({ 'records': records });
    });

};

Dust.prototype.current = function (request, response) {

    this.plantower.read().then((data) => {
        response.json(data);
    }).catch((error) => {
        console.error(error);
        response.json('');
    });

};

Dust.prototype.last  = function(request, response) {

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

Dust.prototype.mean = function(request, response) {

    let result = this.cache.read('mean', request.query);
    if (result !== null) {
        response.json(result);
    } else {
        let divider = 0;
        this.database.find(this.cache.timestamp(request.query), (record) => {
            if (result === null) {
                result = record;
            } else {
                result['concentration_pm1.0_normal'].value += record['concentration_pm1.0_normal'].value;
                result['concentration_pm2.5_normal'].value += record['concentration_pm2.5_normal'].value;
                result.concentration_pm10_normal.value += record.concentration_pm10_normal.value;
                result['concentration_pm1.0_atmos'].value += record['concentration_pm1.0_atmos'].value;
                result['concentration_pm2.5_atmos'].value += record['concentration_pm2.5_atmos'].value;
                result.concentration_pm10_atmos.value += record.concentration_pm10_atmos.value;
                result['count_pm_0.3'].value += record['count_pm_0.3'].value;
                result['count_pm_0.5'].value += record['count_pm_0.5'].value;
                result['count_pm_1.0'].value += record['count_pm_1.0'].value;
                result['count_pm_2.5'].value += record['count_pm_2.5'].value;
                result.count_pm_5.value += record.count_pm_5.value;
                result.count_pm_10.value += record.count_pm_10.value;
            }
            divider++;
        }).then(() => {
            if (result !== undefined && result !== null && divider) {
                result['concentration_pm1.0_normal'].value = round(result['concentration_pm1.0_normal'].value/divider);
                result['concentration_pm2.5_normal'].value = round(result['concentration_pm2.5_normal'].value/divider);
                result.concentration_pm10_normal.value = round(result.concentration_pm10_normal.value/divider);
                result['concentration_pm1.0_atmos'].value = round(result['concentration_pm1.0_atmos'].value/divider);
                result['concentration_pm2.5_atmos'].value = round(result['concentration_pm2.5_atmos'].value/divider);
                result.concentration_pm10_atmos.value = round(result.concentration_pm10_atmos.value/divider);
                result['count_pm_0.3'].value = round(result['count_pm_0.3'].value/divider);
                result['count_pm_0.5'].value = round(result['count_pm_0.5'].value/divider);
                result['count_pm_1.0'].value = round(result['count_pm_1.0'].value/divider);
                result['count_pm_2.5'].value = round(result['count_pm_2.5'].value/divider);
                result.count_pm_5.value = round(result.count_pm_5.value/divider);
                result.count_pm_10.value = round(result.count_pm_10.value/divider);
                this.cache.write('mean', request.query, result);
            }
            response.json(result);
        }).catch((error) => {
            console.error(error);
            response.json('');
        });
    }

};

Dust.prototype.close  = function() {

    return this.database.close();

};

module.exports = Dust;
