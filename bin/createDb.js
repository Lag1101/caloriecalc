/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function(err) {
    if(err)
        logger.error(err);
    else
        logger.log('db created')
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

function requireModels(callback) {
    require('../models/user');
    require('../models/game');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {

    var users = [
        {username: 'luckybug', password: '123'},
        {username: 'test', password: 'test'},

    ];
    var games = [];
    async.series([
        function(cb){
            async.each(users, function(userData, cb) {
                var user = new mongoose.models.User(userData);
                user.save(cb);
            }, cb);
        },
        function(cb) {
            async.each(games, function (gameData, cb) {
                var game = new mongoose.models.Game(gameData);
                game.save(cb);
            }, cb);
        }
    ], function(err){
        return callback(err);
    });


}