'use strict';

const fetch = require('./fetch').fetch;

class ThingSpeak {
    
    static fetch(url) {
        
        return fetch(url, 4, 15000).then((response) => {
            if (response) {
                console.log(response);
                return new Promise((resolve) => resolve());
            } else {
                return new Promise((resolve) => {
                    setTimeout(resolve, 15000);
                }).then(() => {
                    return ThingSpeak.fetch(url);  
                });
            }
        });
        
    }
    
}


module.exports = ThingSpeak;
