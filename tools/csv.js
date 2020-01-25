'use strict';
const Database = require('../database.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'export.csv',
    header: [
        {id: 'temperature', title: 'TEMPERATURE'},
        {id: 'dust', title: 'DUST'},
        {id: 'humidity', title: 'HUMIDITY'},
    ]
});

const temperature = new Database('../db', 'temperature', 24 * 366);
const dust = new Database('../db', 'dust', 24 * 366);
const humidity = new Database('../db', 'humidity', 24 * 366);

const timestamp = Date.now() - 30*24*60*60*1000;

let temperatureResult = [];
let dustResult = [];
let humidityResult = [];
let records = [];

temperature.find(timestamp, (data) => {
    temperatureResult.unshift(data['temperature'].value);
}).then(() => {
    temperature.close();
    dust.find(timestamp, (data) => {
        dustResult.unshift(data['concentration_pm2.5_normal'].value);
    }).then(() => {
        dust.close();
        humidity.find(timestamp, (data) => {
            humidityResult.unshift(data['humidity'].value);
        }).then(() => {
            humidity.close();
            for (let i = 0; i < temperatureResult.length; i++) {
                records.unshift({temperature: temperatureResult[i], dust: dustResult[i], humidity: humidityResult[i]});
            }
            console.log('Writing to CSV file...');
            csvWriter.writeRecords(records).then(() => {
                console.log('Done');
            });
        });
    });
});
