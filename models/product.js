/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: ""
    },
    proteins: {
        type: Number,
        required: true,
        default: ""
    },
    triglyceride: {
        type: Number,
        required: true,
        default: ""
    },
    carbohydrate: {
        type: Number,
        required: true,
        default: ""
    },
    calorie: {
        type: Number,
        required: true,
        default: ""
    },
    mass: {
        type: Number,
        required: true,
        default: ""
    }
});

exports.Product = mongoose.model('Product', schema);
