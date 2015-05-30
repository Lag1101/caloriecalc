/**
 * Created by luckybug on 30.05.15.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var logger = require('../lib/logger');

async.series([
    open,
    dropDatabase
], function(err) {
    if(err)
        logger.error(err);
    else
        logger.log('db cleared')
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}