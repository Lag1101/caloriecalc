/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var logger = require('../lib/logger');

async.series([
    open,
    requireModels,
    dropDatabase,
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
    //var db = mongoose.connection.db;
    //db.dropDatabase(callback);

    mongoose.models.User.remove({},callback);
}

function requireModels(callback) {
    require('../models/product');
    require('../models/user');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    var users = [
        {username: 'luckybug', password: '123'},
        {username: 'nastya', password: '123'},
    ];

    async.waterfall([
        function(cb){
            mongoose.models.Product.find(function(err, products){
                return cb(null, products);
            });
        },
        function(products, cb) {
            async.map(products, function (product, cb) {
                cb(null, product.id);
            }, function(err, ids){
                cb(null, ids);
            });
        },
        function(ids, cb){
            async.each(users, function(userData){
                var user = new mongoose.models.User({
                    username: userData.username,
                    password: userData.password,
                    products: ids});
                user.save(cb);
            }, cb);
        }
    ], callback);
}