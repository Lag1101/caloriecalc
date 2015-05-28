/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var logger = require('../lib/logger');
var products = require('../products').products;

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
    require('../models/day');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    var users = [
        {username: 'luckybug', password: '123'}
    ];

    async.waterfall([
        function(cb){
            async.parallel({
                products: function(cb){
                    mongoose.models.Product.find(function (err, products) {
                        return cb(null, products);
                    });
                },
                days: function (cb) {
                    mongoose.models.Day.find(function (err, days) {
                        return cb(null, days);
                    });
                }
            },
            function(err, res){
                cb(err, res)
            })
        },
        function(res, cb){
            async.parallel({
                    products: function(cb){
                        async.map(res.products, function (product, cb) {
                            cb(null, product._id);
                        }, function(err, ids){
                            cb(null, ids);
                        })
                    },
                    days: function (cb) {
                        async.map(res.days, function (day, cb) {
                            cb(null, day);
                        }, function(err, ids){
                            cb(null, ids);
                        })
                    }
                },
                function(err, res){
                    cb(err, res)
                })
        },
        function(resultIds, cb){
            async.each(users, function(userData){
                var user = new mongoose.models.User({
                    username: userData.username,
                    password: userData.password,
                    products: resultIds.products,
                    daily: resultIds.days,
                    date: products.date,
                    currentDish: products.currentDish
                });
                user.save(cb);
            }, cb);
        }
    ], callback);
}