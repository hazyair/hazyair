'use strict';

const fetch = require('node-fetch');

class Fetch {
    
    static fetch(url, n = 1, timeout = 0) {
        
        return fetch(url).catch((error) => {
            if (n === 1) throw error;
            return new Promise((resolve) => {
                setTimeout(resolve, timeout);
            }).then(() => {
                return Fetch.fetch(url, n - 1, timeout);  
            });
        });
        
    }
    
}

module.exports = Fetch;
