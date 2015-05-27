/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    date: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    breakfast: {
        type: Schema.Types.ObjectId,
        default: null
    },
    firstLunch: {
        type: Schema.Types.ObjectId,
        default: null
    },
    secondLunch: {
        type: Schema.Types.ObjectId,
        default: null
    },
    thirdLunch: {
        type: Schema.Types.ObjectId,
        default: null
    },
    dinner: {
        type: Schema.Types.ObjectId,
        default: null
    },
    secondDinner: {
        type: Schema.Types.ObjectId,
        default: null
    },
    additional: {
        type: [Schema.Types.ObjectId],
        default: []
    }
});

exports.Day = mongoose.model('Day', schema);
