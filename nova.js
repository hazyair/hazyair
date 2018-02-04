'use strict';

const SDS011Wrapper = require("sds011-wrapper");

class Nova {

    constructor(model, options) {

        this.model = model;
        this.sensor = new SDS011Wrapper(options.device);

    }

    dust() {

        return new Promise((resolve, reject) => {

            Promise.all([this.sensor.setReportingMode('active'), this.sensor.setWorkingPeriod(0)]).then(() => {
                this.sensor.on('measure', (data) => {
                    let result = { 'concentration_pm2.5_normal': data['PM2.5'],
                    'concentration_pm10_normal': data.PM10, 'model': this.model, 'timestamp': Date.now() };
                    this.sensor.setWorkingPeriod(30).then(() => {
                        return resolve(result);
                    }).catch((error) => {
                        return resolve(result);
                    });
                });
            }).catch((error) => {
                reject(error);
            });

        });
    }
}

module.exports = Nova;