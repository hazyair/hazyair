'use strict';

class Cache {

    constructor(regions) {

        this.cache = {};
        let i = regions.length;
        while(i--) {
            this.cache[regions[i]] = {};
        }

    }

    clean() {

        let i = Object.keys(this.cache).length;
        while(i--) {
            this.cache[Object.keys(this.cache)[i]] = {};
        }

    }

    read(region, query) {

        let response = null;
        if (this.cache[region][Object.keys(query)[0]] !== undefined) {
            response = this.cache[region][Object.keys(query)[0]];
        }
        return response;

    }

    write(region, query, response) {

        this.cache[region][Object.keys(query)[0]] = response;

    }
}

module.exports = Cache;
