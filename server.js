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

function handle() {

    hazyair.close(() => {
        process.exit(0);
    });

}

fs.readFile(argv.config, 'utf8', (err, config) => {

    if (err) {
        console.log(`Failed to read ${argv.config} file.`);
    }
    
    hazyair = new Hazyair(JSON.parse(config));

    process.on('SIGINT', () => handle());
    process.on('SIGTERM', () => handle());

    hazyair.listen({
        port: argv.port
    });
    
});



