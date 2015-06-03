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

function addProducts(srcList, dstList, cb){
    async.each(srcList, function (productData, cb) {
        Product.prepareProduct(productData);
        dstList.push(productData);
        return cb();
    }, cb);
}

function createUsers(callback) {
    var users = [
        {username: 'luckybug', password: '123'}
    ];

    async.each(users, function(rawUser, cb){
        var user = new mongoose.models.User(rawUser);

        async.waterfall([
            function(cb){
                exProducts.load(cb);
            },
            function(allProducts, cb){
                async.parallel([
                    addProducts.bind(null, allProducts.currentDish.currentDishProducts, user.currentDishProducts),
                    addProducts.bind(null, allProducts.list, user.products)
                ], cb);
            }
        ], function(err){
            if(err) return cb(err);
            else return user.save(cb);
        });

    }, callback);
}