'use strict';

const path = require('path');

const CronJob = require('cron').CronJob;
const moment = require('moment');
const express = require('express');

const Api = require('./api');

let Hazyair = function(model, dev, port) {

	this.api = new Api(model, dev);
	this.port = port;

};

Hazyair.prototype.start = function() { 	

	/*
		Setup the cron job.
	*/

	new CronJob('0 0 * * * *', () => this.api.store(), null, true, moment.tz.guess());

	/*
		Handle incoming requests.
	*/

	const app = express();

	const service = '/' + path.basename(__filename, '.js') + '/api';

	app.use(express.static('public'));


	app.get(service + '/info', (req, res) => this.api.info(req, res));
	app.get(service + '/v1.0/info', (req, res) => this.api.info(req, res));
	app.get(service + '/v1/info', (req, res) => this.api.info(req, res));

	app.get(service + '/current', (req, res) => this.api.current(req, res));
	app.get(service + '/v1.0/current', (req, res) => this.api.current(req, res));
	app.get(service + '/v1/current', (req, res) => this.api.current(req, res));

	app.get(service + '/last', (req, res) => this.api.last(req, res));
	app.get(service + '/v1.0/last', (req, res) => this.api.last(req, res));
	app.get(service + '/v1/last', (req, res) => this.api.last(req, res));

	app.get(service + '/average', (req, res) => this.api.average(req, res));
	app.get(service + '/v1.0/average', (req, res) => this.api.average(req, res));
	app.get(service + '/v1/average', (req, res) => this.api.average(req, res));

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
	this.api.close();

};

module.exports = Hazyair;
