'use strict';

const PMS = require('plantower');

class Plantower {
    
    constructor(model, options) {
        
        // TODO make default ptions
        this.sensor = new PMS(model, options.device);
        
    }
    
    dust() {
        
        return new Promise((resolve, reject) => {
             
            this.sensor.read().then((data) => {
                return resolve(data);
            }).catch((error) => {
                return reject(error);
            });
            
        });
        
    }
}

module.exports = Plantower;
