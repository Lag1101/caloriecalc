/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;
var ProductSchema = require('../models/product').ProductSchema;

var schema = new Schema({
    full:{
        type: [ProductSchema],
        default: []
    },
    portion: {
        type: [ProductSchema],
        default: []
    }
});

exports.Dish = mongoose.model('Dish', schema);
exports.DishSchema = schema;
