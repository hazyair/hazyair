#!/usr/bin/env node
'use strict';

/*
    Process input parameters.
*/

const path = require('path');

const argv = require('yargs').
    usage('Usage:' + path.basename(__filename) + ' [args]').
    example(path.basename(__filename) + ' -m PMS7003 -d /dev/serial0 -p 8081', ' - executed by default').
    alias('m', 'model').
    describe('m', 'device model').
    alias('d', 'device').
    describe('d', 'uart device').
    alias('p', 'port').
    describe('p', 'port').
    help('h').
    alias('h', 'help').argv;

if (argv.model === undefined) {

    argv.model = 'PMS7003';

}

if (argv.device === undefined) {

    argv.device = '/dev/serial0';

}

if (argv.port === undefined) {

    argv.port = '8081';

}

/*
    Spawn Hazy service.
*/

const Hazyair = require('./hazyair'); 

let hazyair = new Hazyair({ 'dust': { 'model': argv.model, 'device': argv.device }, 'temperature': { 'model': argv.model } }, argv.port);

/*
    Handle system signals.
*/

function handle() {

    hazyair.stop();
    process.exit(0);

}

process.on('SIGINT', () => handle());
process.on('SIGTERM', () => handle());

hazyair.start();
