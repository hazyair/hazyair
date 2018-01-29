'use strict';

const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

class Parameter {
    
    constructor(parameter, precision = 0, parameters = []) {
        
        this.parameter = parameter;
        this.precision = precision;
        this.parameters = parameters;
        if (this.parameters.length === 0) {
            this.parameters.push(parameter);
        } else {
            this.parameters = parameters;
        }
        this.database = new Database(parameter, 24 * 366);
        this.cache = new Cache(['last', 'mean']);

    }
    
    store() {

        return new Promise((resolve, reject) => {
            
            this.sensor[this.parameter]().then((data) => {
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

    info(requet, response) {

        this.database.records().then((records) => {
            response.json({ 'records': records });
        });
    
    }

    current(request, response) {

        this.sensor[this.parameter]().then((data) => {
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
                    this.parameters.forEach((item) => {
                        result[item].value += record[item].value;
                    });
                }
                divider++;
            }).then(() => {
                if (result !== undefined && result !== null && divider) {
                    this.parameters.forEach((item) => {
                        result[item].value = round(result[item].value/divider, this.precision);
                    });
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

module.exports = Parameter;
