'use strict';

const path = require('path');
const EventEmitter = require('events');

const CronJob = require('cron').CronJob;
const moment = require('moment');
const express = require('express');
const sse = require('sse-broadcast')();
const colors = require('colors');

require('http-shutdown').extend();

const Dust = require('./dust');
const Temperature = require('./temperature');

class Hazyair extends EventEmitter {

    constructor(config) {

        super();
        this.apis = [ 'info', 'current', 'last', 'mean' ];
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
    }

    listen(options, callback = null) {

        let promise = new Promise((resolve, reject) => {
            const app = express();

            const service = '/' + path.basename(__filename, '.js');

            app.use(express.static('public'));

            app.get(service + '/update', sse.middleware('update'));
        
            // send keep-alive every minute
            setInterval(() => {
                sse.publish('update', ':'); 
            }, 60 * 1000);

            app.get(service + '/info', (request, response) => {
                response.json(this.config);
            });

            this.config.forEach((item) => {

                if (item.hasOwnProperty('parameter')) {
                    if (!item.hasOwnProperty('options') || !item.options.hasOwnProperty('persistent') ||
                    item.options.persistent === true) {
                        new CronJob('0 0 * * * *', () => this[item.parameter].store().then((data) => {
                            sse.publish('update', { 'data': item.parameter } );
                            this.emit(item.parameter, data);
                        }), null, true, moment.tz.guess());
                    }
                    this.apis.forEach((api) => {
                        app.get(service + '/' + item.parameter + '/' + api,
                        (request, response) => this[item.parameter][api](request, response));
                    });
                }

            });

            this.server = app.listen(options, () => {

                var host = this.server.address().address;
                var port = this.server.address().port;
                console.log('hazyair'.green + ' service is listening at http://%s:%s.', host, port);
                resolve();

            }).withShutdown();
        });
        if (callback && typeof callback == 'function') {
            promise.then(callback.bind(null, null), callback);
        }
        return promise;
    }
    
    close(callback = null) {

        let promise = new Promise((resolve, reject) => {
            this.server.forceShutdown( async () => {
                const promises = this.config.map(async (item) => {
                    if (item.hasOwnProperty('parameter')) {
                        await this[item.parameter].close();
                    }
                });         
                await Promise.all(promises);
                console.log('hazyair'.green + ' service has been stopped.');
                return resolve();
            });
        });
        if (callback && typeof callback == 'function') {
            promise.then(callback.bind(null, null), callback);
        }
        return promise;
    }
}

module.exports = Hazyair;
