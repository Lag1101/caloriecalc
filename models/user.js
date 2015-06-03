var crypto = require('crypto');
var async = require('async');
var util = require('util');



var Dish = require('./dish').Dish;
var Product = require('./product').Product;
var DishProduct = require('./product').DishProduct;
var Day = require('./day').Day;
var DaySchema = require('./day').DaySchema;
var DailyProduct = require('../models/product').DailyProduct;
var ProductSchema = require('./product').ProductSchema;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: Schema.Types.String,
        required: true
    },
    salt: {
        type: Schema.Types.String,
        required: true
    },
    created: {
        type: Schema.Types.Date,
        default: Date.now
    },
    products: {
        type: [ProductSchema],
        default: []
    },
    dailyDates:{
        type: [Schema.Types.String],
        default: []
    },
    daily: {
        type: [Schema.Types.String],
        default: []
    },
    date:{
        type: Schema.Types.String,
        default: '2015-06-05'
    },
    dishes:{
        type: [Schema.Types.String],
        default: []
    },
    currentDishProducts:{
        type: [ProductSchema],
        default: []
    }
});

schema.methods.getCurrentDishes = function(callback){
    var user = this;
    async.waterfall([
        function(cb){
            async.map(user.dishes, function(dishId, cb){
                Dish.findById(dishId, cb);
            }, cb);
        },
        function(dishes, cb){
            async.map(dishes, function(dish, cb){
                if(!dish)
                    return cb(new Error("Such product doesn't exist"));
                else
                    return dish.getRaw(cb)
            }, cb);
        }
    ], function(err, rawDishes){
        if(err)
            return callback(err);

        return callback(null, rawDishes);
    });
};

schema.methods.addDish = function(newDish, callback){
    if(!newDish) return;

    var user = this;

    Dish.addDish(newDish, function(err, d){
        user.dishes.push(d.id);
        return callback(err, user);
    });
};
schema.methods.removeDish = function(dishId, callback){
    var user = this;

    var index = user.dishes.indexOf(dishId);
    if(index < 0)
        return callback(new Error(user.username + " doesn't have such dish " + dishId));
    else{
        async.waterfall([
            function(cb){
                Dish.findById(dishId, cb);
            },
            function(dish, cb){
                if(!dish)
                    return cb(new Error("Dish doesn't exist"));
                dish.remove(cb);
            },
            function(product, cb){
                user.dishes.splice(index, 1);
                cb();
            }
        ], function(err){
            if(err) return callback(err);
            return callback(null, user);
        });
    }
};

schema.methods.getCurrentDishProducts = function(callback){
    var user = this;
    async.mapSeries(user.currentDishProducts, function(product, cb){
        return cb(null, product.getRaw());
    }, callback);
};

schema.methods.addDishProduct = function(newDishProductId, callback){
    if(!newDishProductId) return;

    var user = this;

    async.waterfall([
        function(cb){
            var product = user.products.id(newDishProductId);
            if(!product)
                return cb(new Error(newDishProductId, "product doesn't exist"));
            return cb(null, product.getRaw());
        },
        function(rawNewProduct, cb){
            user.currentDishProducts.push(rawNewProduct);
            return cb();
        }
    ],function(err){
        if(err)
            return callback(err);
        else
            return callback(err, user);
    });
};
schema.methods.removeDishProduct = function(dishProductId, callback){
    var user = this;


    user.currentDishProducts.id(dishProductId).remove(function(err){
        return callback(err, user);
    });
};
schema.methods.getDailyByDate = function(date, callback){
    var user = this;

    for(var i = 0; i < user.daily.length; i++){
        var dailyDate = user.dailyDates[i];

        if(dailyDate === user.date) {
            return Day.findById(user.daily[i], function(err, daily){
                if(!daily)
                    return callback(new Error("Daily doesn't exist"));
                return callback(err, daily);

            });
        }
    }

    async.waterfall([
        function(cb){
            return Day.createClear(user.date, cb);
        },
        function(daily, _,  cb){
            user.daily.push(daily._id);
            user.dailyDates.push(user.date);
            user.save(function(err){
                return cb(err, daily);
            })
        }
    ], callback);
};
schema.methods.getRawDailyByDate = function(date, callback){
    var user = this;

    async.waterfall([
        function(cb){
            return user.getDailyByDate(user.date, cb);
        },
        //function(daily, cb){
        //    return Day.findById(dailyId, cb);
        //},
        function(daily, cb){
            return daily.getRaw(cb);
        }
    ], callback);
};
schema.methods.newDailyItem = function(date, newDailyItem, callback){
    var user = this;
    delete newDailyItem.id;
    async.waterfall([
        function(cb){
            user.getDailyByDate(user.date, cb);
        },
        function(daily, cb){
            daily.addProduct(newDailyItem, cb);
        },
        function(daily, cb){
            return daily.save(cb);
        }
    ], function(err, daily){
        if(err)
            return callback(err);

        return callback(err, user);
    });
};
schema.methods.removeDailyItem = function(date, dailyItemId, callback){
    var user = this;
    async.waterfall([
        function(cb){
            user.getDailyByDate(user.date, cb);
        },
        function(daily, cb){
            var index = daily.additional.indexOf(dailyItemId);
            if(index < 0)
                return callback(new Error(user.username + " doesn't have such product in daily " + dailyItemId));
            else{
                async.waterfall([
                    function(cb){
                        DailyProduct.findById(dailyItemId, cb);
                    },
                    function(product, cb){
                        if(!product)
                            return cb(new Error("Item already doesn't exit"));
                        product.remove(cb);
                    },
                    function(product, cb){
                        daily.additional.splice(index, 1);
                        daily.save(cb);
                    }
                ], cb);
            }
        }
    ], function(err, daily){
        if(err)
            return callback(err);

        return callback(err, user);
    });
};
schema.methods.gerRawProductList = function(callback){
    var user = this;
    async.mapSeries(user.products, function(product, cb){
        return cb(null, product.getRaw());
    }, callback);
};
schema.methods.addProduct = function(newProduct, callback){
    if(!newProduct) return;


    var user = this;
    Product.prepareProduct(newProduct);
    user.products.push(newProduct);
    return callback(null, user);
};

schema.methods.removeProduct = function(productId, callback){
    var user = this;

    user.products.id(productId).remove(function(err){
        return callback(err, user);
    });
};

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });

schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
    var User = this;

    async.waterfall([
        function(callback) {
            User.findOne({username: username}, callback);
        },
        function(user, callback) {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback(new AuthError("Пароль неверен"));
                }
            } else {
                var user = new User({username: username, password: password});
                user.save(function(err) {
                    if (err) return callback(err);
                    callback(null, user);
                });
            }
        }
    ], callback);
};

exports.User = mongoose.model('User', schema);


function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;