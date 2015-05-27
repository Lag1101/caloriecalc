/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var mongoose = require('../lib/mongoose');
var async = require('async');
var products = require('../products').products;
var logger = require('../lib/logger');

async.series([
    open,
    requireModels,
    dropDatabase,
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
    require('../models/product');
    require('../models/day');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createDaily(callback) {
    products.load(function(err, list, daily){
        if(err)
            callback(err);

        var times = [
            'breakfast',
            'firstLunch',
            'secondLunch',
            'thirdLunch',
            'dinner',
            'secondDinner'
        ];
        var timesCount = times.length;

        async.each(Object.getOwnPropertyNames(daily), function (date, cb) {
            if(!date) return cb();

            var day = daily[date];

            var dayData = {
                date: date
            };

            for(var i = 0; i < timesCount; i++){
                var t = new mongoose.models.DailyProduct(day[times[i]]);
                dayData[times[i]] = t._id;
                t.save();
            }

            var d = new mongoose.models.Day(dayData);
            d.save(cb)
        }, callback);
    });
}