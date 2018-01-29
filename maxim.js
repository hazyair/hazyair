'use strict';

const ds18b20 = require('ds18b20');

class Maxim {
    
    constructor(model) {
        
        this.model = model;
        ds18b20.sensors((error, ids) => {
            // TODO Add error handling
            this.device = ids[0];
        });
        
    }
    
    temperature() {
        
        return new Promise((resolve, reject) => {
            // TODO Check if this.device avaialble
            ds18b20.temperature(this.device, (error, value) => {
                if (error) {
                    return reject();
                } else {
                    return resolve({ 'temperature': { 'value': value, 'unit': '°C' }, 'model': this.model,
                    'timestamp': Date.now() });
                }
            }); 
        });
        
    }
}

module.exports = Maxim;
