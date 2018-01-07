'use strict';

const path = require('path');

const CronJob = require('cron').CronJob;
const moment = require('moment');
const express = require('express');

const Dust = require('./dust');
const Temperature = require('./temperature');

let Hazyair = function(config, port) {

    if (config.dust !== undefined && config.dust.model !== undefined && config.dust.device !== undefined) {
        this.dust = new Dust(config.dust.model, config.dust.device);
    }
    if (config.temperature !== undefined && config.temperature.model !== undefined) {
        this.temperature = new Temperature(config.temperature.model);
    }
    this.capabilities = [ 'dust', 'temperature'];//, 'pressure', 'humidity' ];
    this.port = port;

};

Hazyair.prototype.info = function(req, res) {

    res.json(this.capabilities);

};

Hazyair.prototype.start = function() {     

    /*
        Handle incoming requests.
    */

    const app = express();

    const service = '/' + path.basename(__filename, '.js');

    app.use(express.static('public'));

    app.get(service + '/info', (req, res) => this.info(req, res));

    this.capabilities.forEach((item) => {

        new CronJob('0 0 * * * *', () => this[item].store(), null, true, moment.tz.guess());

        app.get(service + '/' + item + '/info', (req, res) => this[item].info(req, res));
        app.get(service + '/' + item + '/current', (req, res) => this[item].current(req, res));
        app.get(service + '/' + item + '/last', (req, res) => this[item].last(req, res));
        app.get(service + '/' + item + '/mean', (req, res) => this[item].mean(req, res));

    });

    /*
        Spawn the service.
    */

    this.server = app.listen(this.port, () => {

        var host = this.server.address().address;
        var port = this.server.address().port;
        console.log("hazyair service is listening at http://%s:%s.", host, port);
    
    });

};

Hazyair.prototype.stop = function () {

    this.server.close();
    console.log('hazyair service has been stopped.');
    this.dust.close();

};

module.exports = Hazyair;
