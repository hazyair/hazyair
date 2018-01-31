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
        console.log(`Failed to read ${argv.config} file.`);
    }
    
    config = JSON.parse(config);
    hazyair = new Hazyair(config);

    process.on('SIGINT', () => close());
    process.on('SIGTERM', () => close());

    hazyair.listen({
        port: argv.port
    });
    
});



