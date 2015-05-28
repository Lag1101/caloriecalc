var crypto = require('crypto');
var async = require('async');
var util = require('util');

var Product = require('./product').Product;
var DaySchema = require('./day').DaySchema;
var Day = require('./day').Day;

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
        type: [Schema.Types.String],
        default: []
    },
    daily: {
        type: [DaySchema],
        default: []
    },
    date:{
        type: Schema.Types.String,
        default: ""
    }
});

schema.methods.gerRawProductList = function(callback){
    var user = this;
    async.map(user.products, function(productId, cb){
        Product.findById(productId, function(err, product){
            if(err)
                return cb(err);
            else
                return cb(null, product.getRaw());
        });
    }, callback);
};
schema.methods.getDailyByDate = function(date, callback){
    var user = this;

    for(var i = 0; i < user.daily.length; i++){
        var daily = user.daily[i];
        if(daily.date === date) {
            return callback(null, daily);
        }
    }
    var d = new Day({
        date: date
    });

    user.daily.push(d);

    return user.save(function(err){
        return callback(err, d);
    });
};
schema.methods.getRawDailyByDate = function(date, callback){
    var user = this;

    user.getDailyByDate(date, function(err, daily){
        return daily.getRaw(callback);
    });
};

schema.methods.setDaily = function(newDaily, callback){
    var user = this;

    user.getDailyByDate(newDaily.date, function(err, daily){
        if(err) return callback(err);

        var d = Day.createFromRaw(newDaily);

        daily.update(d);

        callback(null, daily);
    });
};

schema.methods.addProduct = function(newProduct, callback){
    var user = this;
    var product = new Product(newProduct);
    return product.save(function(err){
        user.products.push(product._id);
        return callback(err, user);
    });
};

schema.methods.removeProduct = function(productId, callback){
    var user = this;

    var index = user.products.indexOf(productId)
    if(index < 0)
        return callback(new Error(user.username + " doesn't have such product " + productId));
    else{
        async.waterfall([
            function(cb){
                Product.findById(productId, cb);
            },
            function(product, cb){
                product.remove(cb);
            },
            function(product, cb){
                user.products.splice(index, 1);
                cb();
            }
        ], function(err){
            if(err) return callback(err);
            return callback(null, user);
        });
    }
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