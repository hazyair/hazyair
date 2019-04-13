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
    alias('d', 'dweet').
    describe('d', 'dweet.json').
    default('d', 'dweet.json').
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

let config;
try {
    config = fs.readFileSync(argv.config, 'utf8');
} catch(error) {
    console.error(`Failed to read ${argv.config} file.`);
    config = '{}';
}
config = JSON.parse(config);

let thingspeak;
try {
    thingspeak = fs.readFileSync(argv.thingspeak, 'utf8');
} catch(error) {
    console.error(`Failed to read ${argv.thingspeak} file.`);
    thingspeak = '{}';
}
thingspeak = JSON.parse(thingspeak);

let dweet;
try {
    dweet = fs.readFileSync(argv.dweet, 'utf8');
} catch(error) {
    console.error(`Failed to read ${argv.dweet} file.`);
    dweet = '{}';
}
dweet = JSON.parse(dweet);

hazyair = new Hazyair(config);

hazyair.thingspeak(thingspeak);

hazyair.dweet(dweet);

hazyair.start();

process.on('SIGINT', () => close());
process.on('SIGTERM', () => close());

hazyair.listen({
    port: argv.port
});
