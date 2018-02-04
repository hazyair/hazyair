'use strict';

const fetch = require('./fetch').fetch;

class ThingSpeak {

    static get TIMEOUT() {
        return 15000;
    }

    static get RETRIES() {
        return 4;
    }

    static fetch(url) {

        return fetch(url, ThingSpeak.RETRIES, ThingSpeak.TIMEOUT).then((response) => {
            return response.text();
        }).then((status) => {
            if (status == '0') {
                return new Promise((resolve) => {
                    setTimeout(resolve, ThingSpeak.TIMEOUT);
                }).then(() => {
                    return ThingSpeak.fetch(url);
                });
            } else {
                return new Promise((resolve) => resolve());
            }
        });

    }

}


module.exports = ThingSpeak;
