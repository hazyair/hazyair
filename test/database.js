'use strict';

const assert = require('assert');

const util = require('util');

const exec = util.promisify(require('child_process').exec);

const path = require('path');

const Database = require('../database.js');

async function execute(command) {
    await exec(command);
}


describe('Database', function() {
    
    var location = path.dirname(__filename);
    var database = null;

    before(function() {
        execute('rm -rf test/test.db');
    });

    describe('.Database(\''+location+'\', \'test\', 2)', function() {
        it('should create a database', function(done) {
            database = new Database(location, 'test', 2);
            exec('ls -d test/test.db', (error, stdout, stderr) => {
                assert.equal('test/test.db\n', stdout);
                done();
            }).catch(done);
        });
    });
    
    describe('.records()', function() {
       it('should be empty', function(done) {
           database.records().then((length) => {
               assert.equal(0, length);
               done();
           }).catch(done);
       });
    });
    
    describe('.store({})', function() {
        it('should store', function(done) {
            database.store({}).then(() => {
                assert.ok(true);
                done();
            }).catch(done);
        });
    });
    
    describe('.records()', function() {
       it('should have one element', function(done) {
           database.records().then((length) => {
               assert.equal(1, length);
               done();
           }).catch(done);
       });
    }); 
    
     describe('.find(Date.now()-60*60*1000)', function() {
        it('should find one element with timestamp field', function(done) {
            let counter = 0;
            database.find(Date.now()-60*60*1000, function(data) {
                if (data.timestamp === undefined) {
                    assert.ok(false);
                    done();
                }
                counter++;
            }).then(() => {
                assert.equal(1, counter);
                done();
            }).catch(done);
        });
    });

    describe('.remove()', function() {
        it('should remove oldest element', function(done) {
            database.remove().then(() => {
                assert.ok(true);
                done();
            }).catch(done);
        });
    });

    describe('.records()', function() {
       it('should still have one element', function(done) {
           database.records().then((length) => {
               assert.equal(1, length);
               done();
           }).catch(done);
       });
    });
    
    describe('#removeOldestElement', function() {
       it('remove only oldest element', function(done) {
           database.store({data: 1}).then(() => {
                let timestamp = Date.now();
                database.store({data: 2, timestamp: timestamp}).then(() => {
                   database.remove().then(() => {
                      database.find(Date.now() - 60*60*1000, function (data) {
                          assert.deepEqual({data: 2, timestamp: timestamp}, data);
                          done();
                      }).catch(done);
                   }).catch(done);
               }).catch(done);
           }).catch(done);
       });
    });
    
    describe('.close()', function() {
        it('should close', function(done) {
            database.close().then(() => {
               assert.ok(true);
               done();
            }).catch(done);
        });
    });
    
    describe('.destroy()', function() {
        it('should remove database', function(done) {
            database = new Database(location, 'test', 2);
            database.destroy().then(() => {
                exec('ls -d test/test.db', (error, stdout, stderr) => {
                    assert.equal('', stdout);
                    done();
                }).catch(done);
            }).catch(done);
        });
    });
    
    after(function() {
        execute('rm -rf test/test.db');
    });

});