'use strict';

const path = require('path');

const PouchDB = require('pouchdb-node');

require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });

class Database {

    constructor(location=path.dirname(__filename) + '/db', name, limit) {

        if (!location.endsWith("/")) location += '/';
        this.db = new PouchDB(location + name + '.db');
        this.limit  = limit;
        console.log('Database connection opened.');

    }

    records() {

        return new Promise((resolve, reject) => {
            this.db.allDocs().then((data) => {
                return resolve(data.rows.length);
            }).catch((error) => {
                return reject(error);
            });
        });

    }

    remove() {

        return new Promise((resolve, reject) => {
            this.records().then((limit) => {
                if (limit >= this.limit) {
                    this.db.allDocs({limit: 1, include_docs: true}).then((result) => {
                        this.db.remove(result.rows[0].doc).then((result) => {
                            if (result.ok) {
                                return resolve();
                            } else {
                                return reject(result);
                            }
                        }).catch((error) => {
                            return reject(error);
                        });
                    }).catch((error) => {
                        return reject(error);
                    });
                } else {
                    return resolve();
                }
            }).catch((error) => {
                return reject(error);
            });
        });

    }

    store(data) {

        return new Promise((resolve, reject) => {
            if (data.timestamp === undefined) data.timestamp = Date.now();
            this.remove().then(() => {
                this.db.put({
                    _id: data.timestamp.toString().padStart(16, '0'),
                    data: data
                }).then((result) => {
                    if (result.ok) {
                        return resolve();
                    } else {
                        return reject(result);
                    }
                }).catch((error) => {
                    return reject(error);
                });
            });
        });

    }

    find(timestamp, callback) {

        return new Promise((resolve, reject) => {
            this.db.allDocs({include_docs: true, startkey: timestamp.toString().padStart(16, '0')}).then((result) => {
                result.rows.forEach((item) => {
                    callback(item.doc.data);
                });
                return resolve();
            }).catch((error) => {
                return reject(error);
            });
        });

    }

    close() {

        return new Promise((resolve, reject) => {
            this.db.close().then(() => {
                console.log('Database connection closed.');
                return resolve();
            }).catch((error) => {
                return reject(error);
            });
        });

    }
    
    destroy() {
        
        return new Promise((resolve, reject) => {
            this.db.destroy().then(() => {
                return resolve();
            }).catch((error) => {
                return reject(error);
            });
        });
        
    }

}

module.exports = Database;
