'use strict';

const path = require('path');

const bdb = require('berkeleydb');

const opts = { json: true };

let Database = function(limit) {

	this.dbenv = new bdb.DbEnv();
	if (this.dbenv.open(path.dirname(__filename) + '/db')) {
		console.error('Failed to open database.');
		throw new Error('Failed to open database.');
	}
	this.db = new bdb.Db(this.dbenv);
	this.db.open('hazy.db');
	this.meta = new bdb.Db(this.dbenv);
	this.meta.open('meta.db');
	console.log('Database connection openend.');
	this.limit = limit;

};

Database.prototype.records = function() {

    let records = this.meta.get('records', opts);
    if (records === null) {
    	records = { records : 0 };
    }
    return records;

};

Database.prototype.store = function(data) {

    let txn = new bdb.DbTxn(this.dbenv);
    let records = this.records();
    if (records == this.limit) {
		let cursor = new bdb.DbCursor(this.db);
    	cursor.first();
    	cursor.del();
    	cursor.close();
    	records.records--;
		this.meta.put('records', records, opts);
    }
	this.db.put(data.timestamp.toString().padStart(16, '0'), data, opts);
	records.records ++;
	this.meta.put('records', records, opts);
	txn.commit();

};

Database.prototype.find = function(timestamp, callback) {

	let response = [];
	let cursor = new bdb.DbCursor(this.db);
	let records = this.records();
	let record = cursor.last(opts);
	if (record.key !== null && record.value.timestamp >= timestamp) {
		callback(record.value);
		let i = records.records;
		while(--i) {
			record = cursor.prev(opts);
			if (record.key !== null && record.value.timestamp >= timestamp) {
				callback(record.value);
			} else {
				break;
			}
		}
	}
	cursor.close();
	return response;

};

Database.prototype.close = function () {

	this.db.close();
	this.meta.close();
	this.dbenv.close();
	console.log('Database connection closed.');

};

module.exports = Database;
