/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var products = require('../products').products;
var logger = require('../lib/logger');
var Product = require('../models/product').Product;
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
    mongoose.models.Day.remove({},callback);
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
            callback(err);

        async.each(Object.getOwnPropertyNames(allProducts.dailyProducts), function (date, cb) {
            if(!date) return cb();

            var day = allProducts.dailyProducts[date];

            var dayData = {
                date: date,
                additional: [],
                main: []
            };

            for(var i = 0; i < Day.fields.length; i++){
                var t = new Product(day[Day.fields[i]].products);
                dayData.main.push(t);
            }

            if(day['additional'])
                day['additional'].map(function(additional){
                    var t = new Product(additional.products);
                    dayData.additional.push(t);
                });

            var d = new Day(dayData);
            d.save(cb)
        }, callback);
    });
}