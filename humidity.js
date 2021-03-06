'use strict';

const Parameter = require('./parameter');
const Bosch = require('./bosch');
const Plantower = require('./plantower');
const Xiaomi = require('./xiaomi');

class Humidity extends Parameter {

    constructor(model, persistent, location, options = null) {

        super('humidity', persistent, location);
        switch(model) {
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

module.exports = Humidity;
