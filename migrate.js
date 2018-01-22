#!/usr/bin/env node
'use strict';

const path = require('path');

const argv = require('yargs').
    usage('Usage:' + path.basename(__filename) + ' [args]').
    example(path.basename(__filename) + ' -d dust', ' - executed by default').
    alias('d', 'db').
    describe('d', 'databse').
    default('d', 'dust').
    help('h').
    alias('h', 'help').argv;


const bdb = require('berkeleydb');

const options = { json: true };

const PouchDB = require('pouchdb-node');

let dbenvorig = new bdb.DbEnv();
dbenvorig.open(path.dirname(__filename) + '/db/' + argv.d);
let dborig = new bdb.Db(dbenvorig);
dborig.open('hazyair.db');
let cursor = new bdb.DbCursor(dborig);

let db = new PouchDB(path.dirname(__filename) + '/db/' + argv.d + '.db');

function put(record) {
    if (record.key !== null) {
        db.put({
            _id: record.key,
            data: record.value
        }).then((result) => {
            if (result.ok) {
                put(cursor.next(options));
            }
        }).catch((error) => {
            console.log(error);
        });
    } else {
        dborig.close();
        dbenvorig.close();
        db.close();
    }
}

db.allDocs({include_docs: true}).then((result) => {
    
    put(cursor.first(options));
    
}).catch((err) => {
    console.log(err);
});



