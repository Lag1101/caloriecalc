/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var products = require('../products').products;
var logger = require('../lib/logger');
var DailyProduct = require('../models/product').DailyProduct;
var Day = require('../models/day').Day;

async.series([
    open,
    dropDatabase,
    requireModels,
    createDaily
], function(err) {
    if(err)
        logger.error(err);
    else
        logger.log('db created');
    mongoose.disconnect();
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    //var db = mongoose.connection.db;
    //db.dropDatabase(callback);
    Day.remove({},callback);
    DailyProduct.remove({},callback);
    //var db = mongoose.connection.db;
    //db.dropDatabase(callback);
}

function requireModels(callback) {
    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createDaily(callback) {
    products.load(function(err, allProducts){
        if(err)
            return callback(err);

        async.each(Object.getOwnPropertyNames(allProducts.dailyProducts), function (date, cb) {
            if(!date) return cb(new Error('Date field is required!'));

            var day = allProducts.dailyProducts[date];

            var dayData = {
                date: date
            };

            async.series([
                function(cb){
                    async.each(Day.fields, function(field, cb){
                        var t = new DailyProduct(day[field].products);
                        return t.save(function(err, product){
                            if(err)
                                return cb(err);

                            dayData[field] = product.id;
                            return cb();
                        });
                    }, cb)
                },
                function(cb){
                    async.each(day['additional'], function(additional, cb){
                        var t = new DailyProduct(day[field].products);
                        return t.save(function(err, product){
                            if(err)
                                return cb(err);

                            dayData.additional.push(product.id);
                            return cb();
                        });
                    }, cb);
                }
            ], function(err){
                if(err)
                    return cb(err);
                var d = new Day(dayData);
                d.save(cb)
            });
        }, callback);
    });
}