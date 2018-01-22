'use strict';

const path = require('path');

const CronJob = require('cron').CronJob;
const moment = require('moment');
const express = require('express');
//const sse = require('sse-broadcast')();

const Dust = require('./dust');
const Temperature = require('./temperature');

let Hazyair = function(config) {

    this.config = config;
    this.config.forEach((item) => {

        if (item.hasOwnProperty('parameter')) {
            if (item.parameter === 'dust') {
                if (item.hasOwnProperty('options') && item.options.hasOwnProperty('model') &&
                item.options.hasOwnProperty('device')) {
                    this.dust = new Dust(item.options.model, item.options.device);
                }
            } else if (item.parameter === 'temperature') {
                if (item.hasOwnProperty('options') && item.options.hasOwnProperty('model')) {
                    this.temperature = new Temperature(item.options.model); 
                }
            } else if (item.parameter === 'humidity') {
            
            } else if (item.parameter === 'pressure') {
            
            }
        }

    });
    
};

Hazyair.prototype.info = function(req, res) {

    res.json(this.config);

};
/*
function cron(parameter) {
    parameter.store();
}
*/
Hazyair.prototype.listen = function(options, callback = null) {     

    /*
        Handle incoming requests.
    */

    const app = express();

    const service = '/' + path.basename(__filename, '.js');

    app.use(express.static('public'));
/*
app.get('/events', function (req, res) {
    sse.subscribe('channel', res);
});
*/
    app.get(service + '/info', (req, res) => this.info(req, res));

    this.config.forEach((item) => {

        if (item.hasOwnProperty('parameter')) {
            if (!item.hasOwnProperty('options') || !item.options.hasOwnProperty('persistent') ||
            item.options.persistent === true) {
                new CronJob('0 0 * * * *', () => this[item.parameter].store(), null, true, moment.tz.guess());
            }

            app.get(service + '/' + item.parameter + '/info', (req, res) => this[item.parameter].info(req, res));
            app.get(service + '/' + item.parameter + '/current', (req, res) => this[item.parameter].current(req, res));
            app.get(service + '/' + item.parameter + '/last', (req, res) => this[item.parameter].last(req, res));
            app.get(service + '/' + item.parameter + '/mean', (req, res) => this[item.parameter].mean(req, res));
        }

    });

    /*
        Spawn the service.
    */

    this.server = app.listen(options, () => {

        var host = this.server.address().address;
        var port = this.server.address().port;
        console.log("hazyair service is listening at http://%s:%s.", host, port);
        if (callback !== null) callback();

    });

};

Hazyair.prototype.close = function (callback = null) {

    this.server.close(() => {
        this.config.forEach((item) => {
            if (item.hasOwnProperty('parameter')) {
                this[item.parameter].close();
            }
        });
        console.log('hazyair service has been stopped.');
        if (callback !== null) callback();
    });
};

module.exports = Hazyair;
