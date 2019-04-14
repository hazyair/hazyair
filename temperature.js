'use strict';

const Parameter = require('./parameter');
const Maxim = require('./maxim');
const Bosch = require('./bosch');
const Plantower = require('./plantower');
const Xiaomi = require('./xiaomi');

class Temperature extends Parameter {

    constructor(model, persistent, location, options = null) {

        super('temperature', persistent, location, 1);
        switch(model) {
            case 'DS18B20':
                this.sensor = new Maxim(model);
                break;
            case 'BME280':
            case 'BMP280':
                this.sensor = new Bosch(model, options);
                break;
            case 'PMS5003T':
            case 'PMS5003ST':
                this.sensor = new Plantower(model, options);
                break;
            case 'AirPurifier2':
                this.sensor = new Xiaomi(model, options);
                break;
            default:
                throw new Error('unsupport device model ' + model);
        }

    }

}

module.exports = Temperature;
