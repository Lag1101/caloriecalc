/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    id: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    description: {
        type: Schema.Types.String,
        required: true
    },
    details: {
        type: Schema.Types.String,
        default: ""
    },
    proteins: {
        type: Schema.Types.Number,
        required: true,
        default: 0.0
    },
    triglyceride: {
        type: Schema.Types.Number,
        required: true,
        default: 0.0
    },
    carbohydrate: {
        type: Schema.Types.Number,
        required: true,
        default: 0.0
    },
    calorie: {
        type: Schema.Types.Number,
        required: true,
        default: 0.0
    },
    mass: {
        type: Schema.Types.Number,
        required: true,
        default: 0.0
    }
});

schema.statics.get = function(id, callback) {
    var Product = this;
    Product.findOne({id: id}, callback);
};

schema.methods.getRaw = function() {
    return {
        id:             this.id,
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
