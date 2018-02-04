'use strict';

class Utils {
    
    static get TIMEOUT() {
        return 15000;
    }
    
    static get RETRIES() {
        return 4;
    }
    
    static get LIMIT() {
        return 24 * 366;
    }
    
    static timestamp(query) {

        let timestamp = Date.now();
        if (query.hour !== undefined) {
            timestamp -= 1000 * 60 * 60;
        } else if (query.day !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24;
        } else if (query.week !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24 * 7;
        } else if (query.month !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24 * 31;
        } else if (query.year !== undefined) {
            timestamp -= 1000 * 60 * 60 * 24 * 366;
        }
        return timestamp;

    } 
    
}

module.exports = Utils;
