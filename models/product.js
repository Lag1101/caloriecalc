/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    description: {
        type: Schema.Types.String,
        default: ""
    },
    details: {
        type: Schema.Types.String,
        default: ""
    },
    proteins: {
        type: Schema.Types.Number,
        default: 0.0
    },
    triglyceride: {
        type: Schema.Types.Number,
        default: 0.0
    },
    carbohydrate: {
        type: Schema.Types.Number,
        default: 0.0
    },
    calorie: {
        type: Schema.Types.Number,
        default: 0.0
    },
    mass: {
        type: Schema.Types.Number,
        default: 0.0
    }
});

schema.methods.getRaw = function() {
    return {
        id:             this._id.toString(),
        description:    this.description,
        details:        this.details,
        proteins:       this.proteins,
        triglyceride:   this.triglyceride,
        carbohydrate:   this.carbohydrate,
        calorie:        this.calorie,
        mass:           this.mass
    };
};

exports.Product = mongoose.model('Product', schema);
exports.ProductSchema = schema;
