/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;
var Product = require('../models/product').Product;
var ProductSchema = require('../models/product').ProductSchema;

var schema = new Schema({
    description: {
        type: Schema.Types.String,
        default: ""
    },
    contain:{
        type: [ProductSchema],
        default: []
    }
});

schema.statics.clearCreate = function() {
    var dish = new Dish();
    dish.contain.push(new Product());
    dish.contain.push(new Product());

    return dish;
};

schema.methods.getRaw = function(cb) {
    var dish = this;

    async.waterfall([
        function(cb){
            async.parallel({
                full: function (cb) {
                    cb(null , dish.contain[0]);
                },
                portion: function(cb){
                    cb(null , dish.contain[1]);
                }
            }, cb)
        },
        function(fullAndPortion, cb){
            if(!fullAndPortion.full || !fullAndPortion.portion)
                return cb(new Error("Product doesn't exist"));

            return cb(null, {
                id:     dish._id.toString(),
                description: dish.description,
                full:   fullAndPortion.full.getRaw(),
                portion:   fullAndPortion.portion.getRaw()
            });
        }
    ], cb);
};

schema.methods.setFromRaw = function(newDish, cb) {
    var dish = this;

    //dish.id = newDish.id ? newDish.id : new Schema.Types.ObjectId();
    dish.description = newDish.description;
    async.waterfall([
        function(cb){
            Product.prepareProduct(newDish.full);
            dish.contain[0].setFromRaw(newDish.full);

            Product.prepareProduct(newDish.portion);
            dish.contain[1].setFromRaw(newDish.portion);
            return cb();
        },
        function(cb){
            return cb(null, dish);
        }
    ], cb);
};

var Dish = mongoose.model('Dish', schema);
exports.Dish = Dish;
exports.DishSchema = schema;
