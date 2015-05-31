/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    id:{
        type: Schema.Types.String,
        default: function(){
            var oId = new mongoose.Types.ObjectId();
            return oId.toString();
        }
    },
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

schema.statics.numericFields = [
    'proteins',
    'triglyceride',
    'carbohydrate',
    'calorie',
    'mass'
];

schema.statics.prepareProduct = function(product){
    var Product = this;

    Product.numericFields.map(function(field){
        var val = product[field];
        if( typeof val == "string" ){
            product[field] = parseFloat(val
                .replace(',','.'));
        }
    });
};

schema.methods.setFromRaw = function(raw) {

    //this.id = raw.id ? raw.id : new Schema.Types.ObjectId();
    this.description = raw.description;
    this.details = raw.details;
    this.proteins = raw.proteins;
    this.triglyceride = raw.triglyceride;
    this.carbohydrate = raw.carbohydrate;
    this.calorie = raw.calorie;
    this.mass  = raw.mass;
};

exports.Product = mongoose.model('Product', schema);
exports.DishProduct = mongoose.model('DishProduct', schema);
exports.EndDishProduct = mongoose.model('EndDishProduct', schema);
exports.ProductSchema = schema;
