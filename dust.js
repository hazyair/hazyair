'use strict';

const Plantower = require('plantower');

const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

class Dust {

    constructor(model, device) {

        this.plantower = new Plantower(model, device);
        this.database = new Database('dust', 24 * 366);
        this.cache = new Cache(['last', 'mean']);

    }

    store() {

        return new Promise((resolve, reject) => {
            this.plantower.read().then((data) => {
                this.cache.clean();
                this.database.store(data).then(() => {
                    return resolve(data);
                }).catch((error) => {
                    return reject(error); 
                });
            }).catch((error) => {
                return reject(error);
            });
        });

    }

    info(request, response) {

        this.database.records().then((records) => {
            response.json({ 'records': records });
        });

    }

    current(request, response) {

        this.plantower.read().then((data) => {
            response.json(data);
        }).catch((error) => {
            console.error(error);
            response.json('');
        });

    }

    last(request, response) {

        let result = this.cache.read('last', request.query);
        if (result !== null) {
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

    }

    close() {

        return this.database.close();

    }

}

module.exports = Dust;
