'use strict';

const fetch = require('./fetch').fetch;
const Utils = require('./utils');

class ThingSpeak {
    
    static fetch(url) {
        
        return fetch(url, Utils.RETRIES, Utils.TIMEOUT).then((response) => {
            return response.text();
        }).then((status) => {
            if (status) {
                return new Promise((resolve) => resolve());
            } else {
                return new Promise((resolve) => {
                    setTimeout(resolve, Utils.TIMEOUT);
                }).then(() => {
                    return ThingSpeak.fetch(url);  
                });
            }
        });
        
    }
    
}


module.exports = ThingSpeak;
