'use strict';

const path = require('path');

const PouchDB = require('pouchdb-node');

class Database {

    constructor(name, limit) {

        this.db = new PouchDB(path.dirname(__filename) + '/db/' + name + '.db');
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
                    this.db.allDocs({limit: 1}).then((result) => {
                        this.db.remove(result.rows[0].id).then((result) => {
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
                resolve();
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
            });
        });

    }

}

module.exports = Database;
