'use strict';

const Parameter = require('./parameter');
const Plantower = require('./plantower');

class Dust extends Parameter {

    constructor(model, options) {

        super('dust', 0, [
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

    }

}

module.exports = Dust;
