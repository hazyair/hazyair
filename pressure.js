'use strict';

const Parameter = require('./parameter');
const Bosch = require('./bosch');

class Pressure extends Parameter {

    constructor(model, persistent, options = null) {

        super('pressure', persistent);
        switch(model) {
            case 'BME280':
            case 'BMP280':
                this.sensor = new Bosch(model, options);
                break;
            default:
                throw new Error('unsupport device model ' + model);
        }

    }

}

module.exports = Pressure;
