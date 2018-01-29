'use strict';

const Parameter = require('./parameter'); 
const Maxim = require('./maxim');
const Bosch = require('./bosch');

class Temperature extends Parameter {

    constructor(model, options = null) {
        
        super('temperature', 1);
        switch(model) {
            case 'DS18B20':
                this.sensor = new Maxim(model);
                break;
            case 'BME280':
            case 'BMP280':
                this.sensor = new Bosch(model, options);
                break;
            default:
                throw new Error('unsupport device model ' + model);
        }

    }

}

module.exports = Temperature;
