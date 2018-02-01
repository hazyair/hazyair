'use strict';

const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

class Parameter {
    
    constructor(parameter, persistent = true, precision = 0, parameters = []) {
        
        this.parameter = parameter;
        this.persistent = persistent;
        this.precision = precision;
        this.parameters = parameters;
        if (this.parameters.length === 0) {
            this.parameters.push(parameter);
        } else {
            this.parameters = parameters;
        }
        if (this.persistent) {
            this.database = new Database(parameter, 24 * 366);
            this.cache = new Cache(['last', 'mean']);
        }
    }
    
    read() {

        return new Promise((resolve, reject) => {
            
            this.sensor[this.parameter]().then((data) => {
                return resolve(data);
            }).catch((error) => {
                return reject(error);
            });

        });

    }
    
    store(data) {
        
        return new Promise((resolve, reject) => {
            
            if (this.persistent) {
                this.cache.clean();
                this.database.store(data).then(() => {
                    return resolve(data);
                }).catch((error) => {
                    return reject(error);
                });
            } else {
                return resolve(data);
            }
            
        });
        
    }

    info(requet, response) {
        
        if (this.persistent) {
            this.database.records().then((records) => {
                response.json({ 'records': records });
            });
        } else {
            response.json('');
        }
    
    }

    current(request, response) {

        this.read().then((data) => {
            response.json(data);
        }).catch((error) => {
            console.error(error);
            response.json('');
        });

    }

    last(request, response) {

        if (this.persistent) {
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
        } else {
            response.json('');
        }

    }

    mean(request, response) {

        if (this.persistent) {
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
        } else {
            response.json('');
        }

    }

    close() {
        
        if (this.persistent) {
            return this.database.close();
        } else {
            return new Promise((resolve) => resolve());
        }
    
    }

}

module.exports = Parameter;
