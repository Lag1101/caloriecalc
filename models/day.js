/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;;
var DailyProduct = require('../models/product').DailyProduct;
var ProductSchema = require('../models/product').ProductSchema;

var schema = new Schema({
    date: {
        type: Schema.Types.String,
        required: true
    },
    breakfast:{
        type: Schema.Types.String,
        default: ''
    },
    firstLunch:{
        type: Schema.Types.String,
        default: ''
    },
    secondLunch:{
        type: Schema.Types.String,
        default: ''
    },
    thirdLunch:{
        type: Schema.Types.String,
        default: ''
    },
    dinner:{
        type: Schema.Types.String,
        default: ''
    },
    secondDinner:{
        type: Schema.Types.String,
        default: ''
    },
    additional: {
        type: [Schema.Types.String],
        default: []
    }
});

schema.statics.fields = [
    'breakfast',
    'firstLunch',
    'secondLunch',
    'thirdLunch',
    'dinner',
    'secondDinner'
];

schema.statics.fieldIndexies = {
    breakfast: 0,
    firstLunch: 1,
    secondLunch: 2,
    thirdLunch: 3,
    dinner: 4,
    secondDinner: 5
};

schema.methods.getRaw = function(callback) {
    var day = this;

    var raw = {
        date: day.date,
        additional: [],
        id: day._id.toString()
    };
    async.parallel([
        function(cb){
            async.map(Day.fields, function(field, cb){
                return DailyProduct.getRawById(day[field], function(err, p){
                    raw[field] = p;
                    return cb();
                });
            },cb);
        },
        function(cb){
            async.mapSeries(day.additional, function(product, cb){
                return DailyProduct.getRawById(product, function(err, p){
                    raw.additional.push(p);
                    return cb();
                });
            },cb);
        }
    ], function(err){
        if(err) return callback(err);

        return callback(null, raw);
    });

};

schema.methods.addProduct = function(newProduct, cb){
    var day = this;
    delete newProduct.id;
    var product = new DailyProduct(newProduct);
    return product.save(function(err){
        if(!err)
            day.additional.push(product.id);
        return cb(err, day);
    });
};

schema.statics.createClear = function(date, callback){
    var Day = this;
    var day = new Day({date:date, additional:[]});
    async.map(Day.fields, function(field, cb){
        var product = new DailyProduct();
        product.save(function(err, p){
            if(err)
                return cb(err);
            else {
                day[field] = p.id;
                return cb(null);
            }
        });
    }, function (err){
        if(err)
            return callback(err);
        else
            return day.save(callback);
    });
};

var Day = mongoose.model('Day', schema);
exports.Day = Day;
exports.DaySchema = schema;
