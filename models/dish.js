/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */

var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;
var EndDishProduct = require('../models/product').EndDishProduct;

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
    full: Schema.Types.String,
    portion: Schema.Types.String
});

schema.methods.getRaw = function(cb) {
    var dish = this;

    async.waterfall([
        function(cb){
            async.parallel({
                full: function (cb) {
                    EndDishProduct.findOne({id: dish.full}, cb);
                },
                portion: function(cb){
                    EndDishProduct.findOne({id: dish.portion}, cb);
                }
            }, cb)
        },
        function(fullAndPortion, cb){
            return cb(null, {
                id:     dish.id,
                description: dish.description,
                full:   fullAndPortion.full.getRaw(),
                portion:   fullAndPortion.portion.getRaw()
            });
        }
    ], cb);
};

schema.statics.addDish = function(rawDish, cb) {
    async.parallel({
        full: function (cb) {
            delete rawDish.full.id;
            EndDishProduct.prepareProduct(rawDish.full);
            var product = new EndDishProduct(rawDish.full);
            product.save(function(err){
                return cb(err, product.id)
            });
        },
        portion: function(cb){
            delete rawDish.portion.id;
            EndDishProduct.prepareProduct(rawDish.portion);
            var product = new EndDishProduct(rawDish.portion);
            product.save(function(err){
                return cb(err, product.id)
            });
        }
    }, function(err, ids){
        if(err)
            return cb(err);

        var dish = new Dish({
            full: ids.full,
            portion: ids.portion,
            description: rawDish.description
        });
        return dish.save(cb);
    });
};

schema.methods.setFromRaw = function(newDish, cb) {
    var dish = this;

    //dish.id = newDish.id ? newDish.id : new Schema.Types.ObjectId();
    dish.description = newDish.description;
    async.waterfall([
        function(cb){
            async.parallel({
                full: function (cb) {
                    EndDishProduct.findOne({id: dish.full}, function(err, p){
                        if(err)
                            return cb(err);
                        p.setFromRaw(newDish.full);
                        return p.save(cb);
                    });
                },
                portion: function(cb){
                    EndDishProduct.findOne({id: dish.portion}, function(err, p){
                        if(err)
                            return cb(err);
                        p.setFromRaw(newDish.portion);
                        return p.save(cb);
                    });
                }
            }, cb)
        },
        function(fullAndPortion, cb){
            dish.save(cb);
        }
    ], cb);
};

var Dish = mongoose.model('Dish', schema);
exports.Dish = Dish;
exports.DishSchema = schema;
