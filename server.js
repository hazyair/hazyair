#!/usr/bin/env node
'use strict';

/*
    Process input parameters.
*/

const path = require('path');

const argv = require('yargs').
    usage('Usage:' + path.basename(__filename) + ' [args]').
    example(path.basename(__filename) + ' -p 8081 -c config.json', ' - executed by default').
    alias('p', 'port').
    describe('p', 'port').
    default('p', '8081').
    alias('c', 'config').
    describe('c', 'config.json').
    default('c', 'config.json').
    alias('t', 'thingspeak').
    describe('t', 'thingspeak.json').
    default('t', 'thingspeak.json').
    help('h').
    alias('h', 'help').argv;

const fs = require('fs');

const Hazyair = require('./hazyair'); 

let hazyair;

function close() {

    hazyair.close(() => {
        process.exit(0);
    });

}

fs.readFile(argv.config, 'utf8', (error, config) => {

    if (error) {
        console.error(`Failed to read ${argv.config} file.`);
        config = {};
    } else {
        config = JSON.parse(config);
    }
    
    fs.readFile(argv.thingspeak, 'utf8', (error, thingspeak) => {

        if (error) {
            console.error(`Failed to read ${argv.thingspeak} file.`);
            thingspeak = {};
        } else {
            thingspeak = JSON.parse(thingspeak);
        }

        hazyair = new Hazyair(config);

        hazyair.thingspeak(thingspeak);

        hazyair.start();
    
        process.on('SIGINT', () => close());
        process.on('SIGTERM', () => close());

        hazyair.listen({
            port: argv.port
        });
    });
    
});



