#!/usr/bin/env node
'use strict';

const fs = require('fs');

process.stdin.setEncoding('utf8');

let out;
let str ='';

fs.readFile('config.json', 'utf8', (err, data) => {

    if (err) {
        if (err.errno===-2) {
            out = [];
        } else {
            throw err;
        }
    } else {
        if (data === '' ) {
            out = [];
        } else {
            out = JSON.parse(data);
        }
    }

    process.stdin.on('readable', () => {

        const chunk = process.stdin.read();
        if (chunk !== null) {
            str += chunk;
        }

    });

});

process.stdin.on('end', () => {

    out.push(JSON.parse(str));
    fs.writeFile('config.json', JSON.stringify(out, undefined, 2), 'utf8',(err) => {

        if (err) throw err;
        console.log('The config.json file has been saved.');

    });

});