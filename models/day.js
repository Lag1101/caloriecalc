/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;;
var Product = require('../models/product').Product;
var ProductSchema = require('../models/product').ProductSchema;

var schema = new Schema({
    date: {
        type: Schema.Types.String,
        required: true
    },
    main: {
        type: [ProductSchema],
        default: []
    },
    additional: {
        type: [ProductSchema],
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
schema.statics.clearCreate = function(date){
    var day = new Day({date:date});

    for(var i = 0; i < 6; i++)
        day.main.push(new Product());

    return day;
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
            async.forEachOf(Day.fields, function(field, index, cb){
                raw[Day.fields[index]] = day.main[index].getRaw();
                return cb();
            },cb);
        },
        function(cb){
            async.mapSeries(day.additional, function(product, cb){
                raw.additional.push(product.getRaw());
                return cb();
            },cb);
        }
    ], function(err){
        if(err) return callback(err);

        return callback(null, raw);
    });
};

schema.methods.fixProduct = function(newProduct, cb){
    var day = this;

    var id = newProduct.id;
    Product.prepareProduct(newProduct);

    var product = day.additional.id(id) || day.main.id(id);

    if(!product)
        return cb(new Error('Day',day.date, "doesn't has product", newProduct));

    product.setFromRaw(newProduct);

    return cb(null, day);
};

schema.methods.addProduct = function(newProduct, cb){
    var day = this;
    Product.prepareProduct(newProduct);
    day.additional.push(newProduct);
    return cb(null, day);
};

schema.methods.removeProduct = function(id, cb){
    var day = this;

    var d = day.additional.id(id)
    if(!d)
        return callback(new Error("Already removed"));
    d.remove(function(err){
        return callback(err, day);
    });
};



var Day = mongoose.model('Day', schema);
exports.Day = Day;
exports.DaySchema = schema;
