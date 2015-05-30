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
                    mongoose.models.Product.find(function (err, product) {
                        return cb(null, product);
                    });
                },
                days: function (cb) {
                    mongoose.models.Day.find(function (err, day) {
                        return cb(null, day);
                    });
                },
                dishProducts: function (cb) {
                    mongoose.models.DishProduct.find(function (err, product) {
                        return cb(null, product);
                    });
                },
                dishes: function (cb) {
                    mongoose.models.Dish.find(function (err, dish) {
                        return cb(null, dish);
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
                    },
                    dishProducts: function(cb){
                        async.map(res.dishProducts, function (product, cb) {
                            cb(null, product._id);
                        }, function(err, ids){
                            cb(null, ids);
                        })
                    },
                    dishes: function(cb){
                        async.map(res.dishes, function (dish, cb) {
                            cb(null, dish._id);
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
                    currentDishProducts: resultIds.dishProducts,
                    dishes: resultIds.dishes
                });
                user.save(cb);
            }, cb);
        }
    ], callback);
}