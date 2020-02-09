'use strict';
const Database = require('../database.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'data.csv',
    header: [
        {id: 'timestamp', title: 'TIMESTAMP'},
        {id: 'temperature', title: 'TEMPERATURE'},
        {id: 'dust', title: 'DUST'},
        {id: 'humidity', title: 'HUMIDITY'},
        {id: 'pressure', title: 'PRESSURE'},
    ]
});

const temperature = new Database('../db', 'temperature', 24 * 366);
const dust = new Database('../db', 'dust', 24 * 366);
const humidity = new Database('../db', 'humidity', 24 * 366);
const pressure = new Database('../db', 'pressure', 24 * 366);

const timestamp = Date.now() - 366*24*60*60*1000;

let records = [];
let result = {};

temperature.find(timestamp, (data) => {
    if (result[data.timestamp] == null) {
        result[data.timestamp] = {};
    }
    result[data.timestamp]['temperature'] = data['temperature'].value;
}).then(() => {
    temperature.close();
    dust.find(timestamp, (data) => {
        let found = false;
        for (let t in result) {
            if (Math.abs(data.timestamp - t) < 60*1000) {
                result[t]['concentration_pm2.5_normal'] = data['concentration_pm2.5_normal'].value;
                found = true;
            }
        }
        if (!found) {
            if (result[data.timestamp] == null) {
                result[data.timestamp] = {};
            }
            result[data.timestamp]['concentration_pm2.5_normal'] = data['concentration_pm2.5_normal'].value;
        }
    }).then(() => {
        dust.close();
        humidity.find(timestamp, (data) => {
            let found = false;
            for (let t in result) {
                if (Math.abs(data.timestamp - t) < 60*1000) {
                    result[t]['humidity'] = data['humidity'].value;
                    found = true;
                }
            }
            if (!found) {
                if (result[data.timestamp] == null) {
                    result[data.timestamp] = {};
                }
                result[data.timestamp]['humidity'] = data['humidity'].value;
            }
        }).then(() => {
            humidity.close();
            pressure.find(timestamp, (data) => {
                let found = false;
                for (let t in result) {
                    if (Math.abs(data.timestamp - t) < 60*1000) {
                        result[t]['pressure'] = data['pressure'].value;
                        found = true;
                    }
                }
                if (!found) {
                    if (result[data.timestamp] == null) {
                        result[data.timestamp] = {};
                    }
                    result[data.timestamp]['pressure'] = data['pressure'].value;
                }
            }).then(() => {
                pressure.close();
                for (let timestamp in result) {
                    records.push({timestamp: timestamp, temperature: result[timestamp]['temperature'],
                    dust: result[timestamp]['concentration_pm2.5_normal'], 
                    humidity: result[timestamp]['humidity'], pressure: result[timestamp]['pressure']});
                }
                console.log('Writing to CSV file...');
                csvWriter.writeRecords(records).then(() => {
                    console.log('Done');
                });
            });
        });
    });
});
