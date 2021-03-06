/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var logger = require('../lib/logger');
var User  = require('../models/user').User;
var Product  = require('../models/product').Product;
var Day  = require('../models/day').Day;
var DishProduct  = require('../models/product').DishProduct;
var Dish  = require('../models/dish').Dish;
var exProducts = require('../products').products;

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function(err) {
    if(err)
        logger.error(err);
    else
        logger.info('db created')
    mongoose.disconnect();
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    //var db = mongoose.connection.db;
    //db.dropDatabase(callback);

    User.remove({},callback);
}

function requireModels(callback) {
    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function addProducts(srcList, user, cb){
    async.each(srcList, function (productData, cb) {
        user.addProduct(productData, cb);
    }, cb);
}

function addDishProducts(srcList, user, cb){
    async.each(srcList, function (productData, cb) {
        Product.prepareProduct(productData);
        user.products.push(productData);
        return cb(null, user);
    }, cb);
}
function addDaily(dailyProducts, user, callback){
    async.each(Object.getOwnPropertyNames(dailyProducts), function (date, cb) {
        if(!date) return cb(new Error('Date field is required!'));

        async.waterfall([
            function(cb){
                user.getDailyByDate(date, cb);
            },
            function(daily, cb){
                var rawDay = dailyProducts[date];

                async.parallel([
                    function(cb){
                        async.forEachOf(Day.fields, function(field, index, cb){
                            var raw = rawDay[field].products || new Product();
                            Product.prepareProduct(raw);
                            daily.main[index].setFromRaw(raw);
                            return cb();
                        }, cb)
                    },
                    function(cb){
                        if(rawDay['additional'])
                            async.eachSeries(rawDay['additional'], function(raw, cb){
                                raw = raw || new Product();
                                Product.prepareProduct(raw);
                                daily.additional.push(raw);
                                return cb();
                            }, cb);
                        else
                            return cb()
                    }
                ],cb);
            }
        ], cb);

    },callback);
}

function addDish(srcDishList, user, cb){
    async.each(srcDishList, function (dishData, cb) {
        dishData.full = dishData.dish;
        user.addDish(dishData, cb);
    }, cb);
}

function createUsers(callback) {
    var users = [
        {username: 'luckybug', password: '123'},
        {username: 'Hathor', password: '123'}
    ];

    async.each(users, function(rawUser, cb){
        var user = new mongoose.models.User(rawUser);

        async.waterfall([
            function(cb){
                exProducts.load(cb);
            },
            function(allProducts, cb){
                async.parallel([
                    addProducts.bind(null, allProducts.currentDish.currentDishProducts, user),
                    addDishProducts.bind(null, allProducts.list, user),
                    addDaily.bind(null, allProducts.dailyProducts, user),
                    addDish.bind(null, allProducts.dishList, user)
                ], cb);
            }
        ], function(err){
            if(err) return cb(err);
            else return user.save(cb);
        });

    }, callback);
}