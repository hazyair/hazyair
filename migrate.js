#!/usr/bin/env node
'use strict';

const path = require('path');

const bdb = require('berkeleydb');

const opts = { json: true };


let dbenv = new bdb.DbEnv();
dbenv.open(path.dirname(__filename) + '/db');
let db = new bdb.Db(dbenv);
db.open('hazy.db');
let meta = new bdb.Db(dbenv);
meta.open('meta.db');

let dbenvdust = new bdb.DbEnv();
dbenvdust.open(path.dirname(__filename) + '/db/dust');
let dbdust = new bdb.Db(dbenvdust);
dbdust.open('hazyair.db');
let metadust = new bdb.Db(dbenvdust);
metadust.open('meta.db');

let records = meta.get('records', opts);
metadust.put('records', records, opts);
let cursor = new bdb.DbCursor(db);
let record = cursor.first(opts);
dbdust.put(record.key, record.value, opts);
for (let i =0 ; i < records.records-1; i ++) {
    record = cursor.next(opts);
    dbdust.put(record.key, record.value, opts);
}

db.close();
meta.close();
dbenv.close();

dbdust.close();
metadust.close();
dbenvdust.close();
