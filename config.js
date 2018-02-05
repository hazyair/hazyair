#!/usr/bin/env node
'use strict';

const fs = require('fs');

require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });

process.stdin.setEncoding('utf8');

let output;
let string ='';

fs.readFile('config.json', 'utf8', (error, data) => {

    if (error) {
        if (error.errno===-2) {
            output = [];
        } else {
            throw error;
        }
    } else {
        if (data === '') {
            output = [];
        } else {
            output = JSON.parse(data);
        }
    }

    process.stdin.on('readable', () => {

        const chunk = process.stdin.read();
        if (chunk !== null) {
            string += chunk;
        }

    });

});

process.stdin.on('end', () => {

    output.push(JSON.parse(string));
    fs.writeFile('config.json', JSON.stringify(output, undefined, 2), 'utf8',(error) => {

        if (error) throw error;
        console.log('The config.json file has been saved.');

    });

});