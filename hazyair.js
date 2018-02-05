'use strict';

const path = require('path');
const EventEmitter = require('events');

const CronJob = require('cron').CronJob;
const moment = require('moment');
const express = require('express');
const sse = require('sse-broadcast')();
const chalk = require('chalk');

require('http-shutdown').extend();

const Dust = require('./dust');
const Temperature = require('./temperature');
const Pressure = require('./pressure');
const Humidity = require('./humidity');
const ThingSpeak = require('./thingspeak');

/**
 * Class implementing the interface to the Hazyair monitoring tool.
 *
 * @extends EventEmitter
 *
 * @example
 * let hazyair = new Hazyair([{
 *     parameter: 'dust',
 *     model: 'PMS7003',
 *     persistent: true,
 *     options: {
 *         device: '/dev/serial0'
 *     }
 * }]);
 */
class Hazyair extends EventEmitter {

    /**
     * Create a Hazyair instance.
     *
     * @param {Object} config <code>[ { parameter: ('dust'\|'temperature'\|'pressure'\|'humidity'), model: ...,
     * persistent: (true\|false), options: {... } }, ...]</code>
     *
     */
    constructor(config) {

        super();
        this.apis = [ 'info', 'current', 'last', 'mean' ];
        this.config = config;
        this.config.forEach((item) => {

            if (item.hasOwnProperty('parameter')) {
                if (item.parameter === 'dust') {
                    if (item.hasOwnProperty('model') && item.hasOwnProperty('options') &&
                    item.options.hasOwnProperty('device')) {
                        this.dust = new Dust(item.model, item.persistent, item.options);
                    }
                } else if (item.parameter === 'temperature') {
                    let options = null;
                    if (item.hasOwnProperty('options')) {
                        options = item.options;
                    }
                    if (item.hasOwnProperty('model')) {
                        this.temperature = new Temperature(item.model, item.persistent, options); 
                    }
                } else if (item.parameter === 'pressure') {
                    if (item.hasOwnProperty('model') && item.hasOwnProperty('options')) {
                        this.pressure = new Pressure(item.model, item.persistent, item.options); 
                    }
                } else if (item.parameter === 'humidity') {
                    if (item.hasOwnProperty('model') && item.hasOwnProperty('options')) {
                        this.humidity = new Humidity(item.model, item.persistent, item.options); 
                    }
                }
            }

        });
    }

    /**
     * Send all sensors data to the [ThingSpeak™](https://thingspeak.com) service once they are available.
     *
     * @param {Object} config <code>{ api_key: ..., (dust\|temperature\|pressure\|humidity):
     * ({...: 'field1', ...}\|('field1'\|...)) } }</code>
     *
     * @example
     * hazyair.thingspeak({
     *     api_key: 'XXXXXXXXXXXXXXXX',
     *     dust: {
     *         concentration_pm10_normal : 'field1'
     *     }
     * });
     */
    thingspeak(config) {

        if (config.hasOwnProperty('parameters')) {
            let length = Object.keys(config.parameters).length;
            let endpoint = 'https://api.thingspeak.com/update?api_key=' + config.api_key;
            let wait = length;
            let url = endpoint;
            Object.keys(config.parameters).forEach((parameter) => {
                this.on(parameter, (data) => {
                    if (typeof config.parameters[parameter] == 'string') {
                        url += '&' + config.parameters[parameter] + '=' + data[parameter].value;
                    } else {
                        Object.keys(config.parameters[parameter]).forEach((item) => {
                            url += '&' + config.parameters[parameter][item] + '=' + data[item].value;
                        });
                    }
                    wait --;
                    if (!wait) {
                        ThingSpeak.fetch(url).then(() => {
                            wait = length;
                            url = endpoint;
                        });
                    }
                });
            });
        }

    }

    /**
     * Start monitoring of the specified parameter(s).
     *
     * @fires Hazyair#dust
     * @fires Hazyair#temperature
     * @fires Hazyair#pressure
     * @fires Hazyair#humidity
     *
     * @example
     * hazyair.start()
     */
    start() {

        this.config.forEach((item) => {

            if (item.hasOwnProperty('parameter')) {
                new CronJob('0 0 * * * *', () => this[item.parameter].read().then((data) => {
                    this[item.parameter].store(data).then((data) => {
                        sse.publish('update', { 'data': item.parameter } );
                        this.emit(item.parameter, data);
                    });
                }), null, true, moment.tz.guess());
            }

        });

    }

    /**
     * Start http web service.
     *
     * @param {Object} options passed to the [http server](https://nodejs.org/api/net.html#net_server_listen)
     * @param {Function} [callback] function passed to the
     * [http server](https://nodejs.org/api/net.html#net_server_listen)
     * @returns {Promise} Promise object
     *
     * @example
     * hazyair.listen({
     *     port: 8081
     * }).then(() => {
     *     // web service started
     * });
     */
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
                    this.apis.forEach((api) => {
                        app.get(service + '/' + item.parameter + '/' + api,
                        (request, response) => this[item.parameter][api](request, response));
                    });
                }

            });

            this.server = app.listen(options, () => {

                var host = this.server.address().address;
                var port = this.server.address().port;
                console.log(chalk.green('hazyair') + ' service is listening at http://%s:%s.', host, port);
                resolve();

            }).withShutdown();
        });
        if (callback && typeof callback == 'function') {
            promise.then(callback.bind(null, null), callback);
        }
        return promise;
    }

    /**
     * Close http web server and access to the databases if required.
     *
     * @param {Function} [callback] function executed when action is completed
     * @returns {Promise} Promise object
     *
     * @example
     * hazyair.close().then(() => {
     *     // hazyair closed
     * });
     */
    close(callback = null) {

        let promise = new Promise((resolve, reject) => {
            this.server.forceShutdown( async () => {
                const promises = this.config.map(async (item) => {
                    if (item.hasOwnProperty('parameter')) {
                        await this[item.parameter].close();
                    }
                });
                await Promise.all(promises);
                console.log(chalk.green('hazyair') + ' service has been stopped.');
                resolve();
            });
        });
        if (callback && typeof callback == 'function') {
            promise.then(callback.bind(null, null), callback);
        }
        return promise;
    }
}

module.exports = Hazyair;
