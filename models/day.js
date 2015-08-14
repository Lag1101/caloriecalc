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
//schema.set('redisCache', true);
//schema.set('expires', 60*30);

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

schema.methods.fixProduct = function(newProduct, cb){
    var day = this;

    var id = newProduct._id;
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
    return cb(null, day.additional[day.additional.length-1]);
};

schema.methods.removeProduct = function(id, cb){
    var day = this;

    var d = day.additional.id(id)
    if(!d)
        return cb(new Error(id + " already removed"));
    d.remove(function(err){
        return cb(err, day);
    });
};



var Day = mongoose.model('Day', schema);
exports.Day = Day;
exports.DaySchema = schema;
