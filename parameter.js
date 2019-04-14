'use strict';

const Database = require('./database');
const Cache = require('./cache');
const round = require('./round');

class Parameter {

    static get LIMIT() {

        return 24 * 366;

    }

    static timestamp(query) {

        let timestamp = Date.now();
        if (query.hour !== undefined) {
            timestamp -= 1000 * 60 * 60;
        } else if (query.day !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24;
        } else if (query.week !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24 * 7;
        } else if (query.month !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24 * 31;
        } else if (query.year !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24 * 366;
        }
        return timestamp;

    }

    constructor(parameter, persistent = true, location, precision = 0, parameters = []) {

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
            this.database = new Database(location, parameter, Parameter.LIMIT);
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
                this.database.find(Parameter.timestamp(request.query), (record) => {
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
                this.database.find(Parameter.timestamp(request.query), (record) => {
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
