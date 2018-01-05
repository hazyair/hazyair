'use strict';

let Cache = function(regions) {

    this.cache = {};
    let i = regions.length;
    while(i--) {
        this.cache[regions[i]] = {};
    }

};

Cache.prototype.timestamp = function(query) {

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

}; 

Cache.prototype.clean = function() {

    let i = Object.keys(this.cache).length;
    while(i--) {
        this.cache[Object.keys(this.cache)[i]] = {};
    }

};

Cache.prototype.read = function(region, query) {

    let response = null;
    if (this.cache[region][Object.keys(query)[0]] !== undefined) {
        response = this.cache[region][Object.keys(query)[0]];
    }
    return response;

};

Cache.prototype.write = function(region, query, response) {

    this.cache[region][Object.keys(query)[0]] = response;

};

module.exports = Cache;
