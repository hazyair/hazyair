'use strict';

const Parameter = require('./parameter'); 
const Bosch = require('./bosch');

class Humidity extends Parameter {

    constructor(model, options = null) {
        
        super('humidity');
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

module.exports = Humidity;
