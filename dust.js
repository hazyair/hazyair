'use strict';

const Parameter = require('./parameter');
const Plantower = require('./plantower');
const Nova = require('./nova');
const Xiaomi = require('./xiaomi');

class Dust extends Parameter {

    constructor(model, persistent, location, options = null) {
        
        switch(model) {
            case 'PMS1003':
            case 'PMS5003':
            case 'PMS5003I':
            case 'PMS5003P':
            case 'PMS6003':
            case 'PMS7003':
            case 'PMS7003M':
            case 'PMS7003P':
            case 'PMSA003':
            case 'PMS5003ST':
            case 'PMS5003S':
                super('dust', persistent, location, 0, [
                    'concentration_pm1.0_normal',
                    'concentration_pm2.5_normal',
                    'concentration_pm10_normal',
                    'concentration_pm1.0_atmos',
                    'concentration_pm2.5_atmos',
                    'concentration_pm10_atmos',
                    'count_pm_0.3',
                    'count_pm_0.5',
                    'count_pm_1.0',
                    'count_pm_2.5',
                    'count_pm_5',
                    'count_pm_10'
                ]);
                this.sensor = new Plantower(model, options);
                break;
            case 'PMS3003':
                super('dust', persistent, location, 0, [
                    'concentration_pm1.0_normal',
                    'concentration_pm2.5_normal',
                    'concentration_pm10_normal',
                    'concentration_pm1.0_atmos',
                    'concentration_pm2.5_atmos',
                    'concentration_pm10_atmos'
                ]);
                this.sensor = new Plantower(model, options);
                break;
            case 'PMS5003T':
                super('dust', persistent, location, 0, [
                    'concentration_pm1.0_normal',
                    'concentration_pm2.5_normal',
                    'concentration_pm10_normal',
                    'concentration_pm1.0_atmos',
                    'concentration_pm2.5_atmos',
                    'concentration_pm10_atmos',
                    'count_pm_0.3',
                    'count_pm_0.5',
                    'count_pm_1.0',
                    'count_pm_2.5'
                ]);
                this.sensor = new Plantower(model, options);
                break;
            case 'SDS011':
            case 'SDS018':
            case 'SDS021':
                super('dust', persistent, location, 0, [
                    'concentration_pm2.5_normal',
                    'concentration_pm10_normal'
                ]);
                this.sensor = new Nova(model, options);
                break;
            case 'AirPurifier2':
                super('dust', persistent, location, 0, [
                    'concentration_pm2.5_normal'
                ]);
                this.sensor = new Xiaomi(model, options);
                break;
            default:
                throw new Error('unsupport device model ' + model);
        }

    }

}

module.exports = Dust;
