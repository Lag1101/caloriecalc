/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var products = require('../products').products;
var logger = require('../lib/logger');
var DishProduct = require('../models/product').DishProduct;

async.series([
    open,
    requireModels,
    dropDatabase,
    createUsers
], function(err) {
    if(err)
        logger.error(err);
    else
        logger.log('db created');
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    //var db = mongoose.connection.db;
    //db.dropDatabase(callback);
    DishProduct.remove({},callback);
    //var db = mongoose.connection.db;
    //db.dropDatabase(callback);
}

function requireModels(callback) {
    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    products.load(function(err, allProducts){
        if(err)
            console.error(err);

        async.each(allProducts.currentDish.currentDishProducts, function (productData, cb) {

            DishProduct.prepareProduct(productData);
            var product = new Product(productData);
            product.save(cb);
        }, callback);
    });
}