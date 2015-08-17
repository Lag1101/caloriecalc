var crypto = require('crypto');
var async = require('async');
var util = require('util');



var Dish = require('./dish').Dish;
var DishSchema = require('./dish').DishSchema;
var Product = require('./product').Product;
var Day = require('./day').Day;
var DaySchema = require('./day').DaySchema;
var ProductSchema = require('./product').ProductSchema;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    body:{
        type: Schema.Types.Mixed,
        default:{
            weight: 0,
            height: 0,
            age: 0,
            activity: 1.2
        }
    },

    norm:{
        type: Schema.Types.Mixed,
        default:{
            calorie: {min: 0, max: 0},
            proteins: {min: 0, max: 0},
            triglyceride: {min: 0, max: 0},
            carbohydrate: {min: 0, max: 0}
        }
    },

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
    daily: {
        type: [DaySchema],
        default: []
    },
    date:{
        type: Schema.Types.String,
        default: '2015-06-05'
    },
    dishes:{
        type: [DishSchema],
        default: []
    },
    currentDishProducts:{
        type: [ProductSchema],
        default: []
    }
});
//schema.set('redisCache', true);
//schema.set('expires', 60*30);

schema.methods.setBody = function(body, callback){
    var user = this;
    user.body = body;
    return callback(null, user);
};

schema.methods.getBody = function(body, callback){
    var user = this;
    return callback(null, user.body);
};

schema.methods.setNorm = function(norm, callback){
    var user = this;
    user.norm = norm;
    return callback(null, user);
};

schema.methods.getNorm = function(norm, callback){
    var user = this;
    user.norm = norm;
    return callback(null, user.norm);
};

schema.methods.getCurrentDishes = function(callback){
    var user = this;

    return callback(null, user.dishes);
};

schema.methods.addDish = function(newDish, callback){
    if(!newDish) return callback(new Error('Empty dish'));

    var user = this;

    var dish = Dish.clearCreate();
    dish.setFromRaw(newDish, function(err, dish){
        if(err)
            return callback(err);
        else{
            user.dishes.push(dish);
            return callback(null, user);
        }
    });
};
schema.methods.removeDish = function(dishId, callback){
    var user = this;
    var d = user.dishes.id(dishId);
    if(!d)
        return callback(new Error("Already removed"));
    d.remove(function(err){
        return callback(err, user);
    });
};

schema.methods.getCurrentDishProducts = function(callback){
    var user = this;
    return callback(null, user.currentDishProducts);
    //async.mapSeries(user.currentDishProducts, function(product, cb){
    //    return cb(null, product.getRaw());
    //}, callback);
};

schema.methods.addDishProduct = function(newDishProductId, callback){
    if(!newDishProductId) return callback(new Error('Empty id'));

    var user = this;

    async.waterfall([
        function(cb){
            var product = user.products.id(newDishProductId);
            if(!product)
                return cb(new Error(newDishProductId, "product doesn't exist"));
            return cb(null, product.getRaw());
        },
        function(rawNewProduct, cb){
            delete rawNewProduct._id;
            user.currentDishProducts.push(rawNewProduct);
            return cb(null, user.currentDishProducts[user.currentDishProducts.length-1]);
        }
    ], callback);
};
schema.methods.removeDishProduct = function(dishProductId, callback){
    var user = this;

    var p = user.currentDishProducts.id(dishProductId);
    if(!p)
        return callback(new Error(dishProductId, "already removed"));
    p.remove(function(err){
        return callback(err, user);
    });
};
schema.methods.getDailyByDate = function(date, callback){
    var user = this;


    async.waterfall([
        function(cb){
            for(var i = 0; i < user.daily.length; i++) {
                var day = user.daily[i];
                if(day.date === date)
                    return cb(null, day);
            }
            return cb(null, null);
        },
        function(day, cb){
            if(!day) {
                var newDay = Day.clearCreate(date);
                user.daily.push(newDay);
                return cb(null, user.daily[user.daily.length-1]);
            }
            else return cb(null, day);
        }
    ], callback);
};
schema.methods.getRawDailyByDate = function(date, callback){
    var user = this;

    async.waterfall([
        function(cb){
            return user.getDailyByDate(user.date, cb);
        },
        function(daily, cb){
            return cb(null, daily);
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
        }
    ], function(err, dailyItem){
        if(err)
            return callback(err);

        return callback(err, dailyItem);
    });
};
schema.methods.removeDailyItem = function(date, dailyItemId, callback){
    var user = this;
    async.waterfall([
        function(cb){
            user.getDailyByDate(user.date, cb);
        },
        function(daily, cb){
            daily.removeProduct(dailyItemId, cb);
        }
    ], function(err, daily){
        if(err)
            return callback(err);

        return callback(err, user);
    });
};
schema.methods.gerRawProductList = function(callback){
    var user = this;
    return callback(null, user.products);
    //async.mapSeries(user.products, function(product, cb){
    //    return cb(null, product.getRaw());
    //}, callback);
};
schema.methods.addProduct = function(newProduct, callback){
    if(!newProduct) return callback(new Error('Empty product'));


    var user = this;
    //Product.prepareProduct(newProduct);
    user.products.push(newProduct);
    return callback(null, user.products[user.products.length-1]);
};

schema.methods.removeProduct = function(productId, callback){
    var user = this;

    var p = user.products.id(productId);
    if(!p)
        return callback(new Error("Already removed"));
    p.remove(function(err){
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

schema.statics.login = function(username, password, callback) {
    var User = this;

    async.waterfall([
        function(callback) {
            User.findOne({username: username}, callback);
        },
        function(user, callback) {
            if (!user || !user.checkPassword(password))
                callback(new AuthError("Пароль или имя неверены"));
            else
                callback(null, user);
        }
    ], callback);
};

schema.statics.authorize = function(username, password, callback) {
    var User = this;

    async.waterfall([
        function(callback) {
            User.findOne({username: username}, callback);
        },
        function(user, callback) {
            if (user) {
                callback(new AuthError("Это имя уже занято"));
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