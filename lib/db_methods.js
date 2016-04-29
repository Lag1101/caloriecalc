/**
 * Created by luckybug on 29.04.16.
 */


var User = require('../models/user').User;
var Product = require('../models/product').Product;
var Dish = require('../models/dish').Dish;
var Day = require('../models/day').Day;
var async = require('async');
var logger = require('../lib/logger');


function getDaily(user, date, callback){
    user.getRawDailyByDate(date, callback);
}
function getCurrentDate(user, callback){
    return callback(null, user.date);
}
function setCurrentDateAndGetDaily(user, date, callback){
    if(!date) {
        logger.error('Empty date');
        return callback(new Error('Empty date'));
    }

    user.date = date;
    logger.info('set date', date);
    return getDaily(user, date, callback);
}
function getBody(user, callback){
    logger.info('get body', user.body);
    return callback(null, user.body);
}
function setBody(user, body, callback){
    if(!body) {
        logger.error('Empty body');
        return callback(new Error('Empty body'));
    }

    user.body = body;
    logger.info('set body', body);
    return callback();
}
function getNorm(user, callback){
    return callback(null, user.norm);
}
function setNorm(user, norm, callback){
    if(!norm) {
        logger.error('Empty norm');
        return callback(new Error('Empty norm'));
    }

    user.norm = norm;
    logger.info('set norm', norm);
    return callback();
}

function setNormAndBody(user, norm, body, callback){
    if(!norm) {
        logger.error('Empty norm');
        return callback(new Error('Empty norm'));
    }
    if(!body) {
        logger.error('Empty body');
        return callback(new Error('Empty body'));
    }

    user.norm = norm;
    user.body = body;
    logger.info('set norm and body', norm);
    return callback();
}

function getNormAndBody(user, callback){
    logger.info('get norm and body', user.body);
    return callback(null, user.norm, user.body);
}

function getBundle(user, callback){
    async.parallel({
        list: function(cb){
            user.gerRawProductList(cb);
        },
        date: function(cb){
            return cb(null, user.date);
        },
        daily: function(cb){
            user.getRawDailyByDate(user.date, cb);
        },
        currentDishProducts: function(cb){
            user.getCurrentDishProducts(cb);
        },
        currentDishes: function(cb){
            user.getCurrentDishes(cb);
        },
        norm: function(cb){
            return cb(null, user.norm);
        }
    }, callback);
}

function saveUser(user, callback){
    logger.info('Try to save', user && user.username);
    if(!user)
        return callback && callback(new Error("Such user doesn't exist"));
    return user.save(callback);
}

function saveCurrentDishProducts(user, dishProductList){
    user.currentDishProducts = dishProductList;
}
function saveProductList(user, productList){
    user.products = productList;
}
function saveDishes(user, dishes){
    user.dishes = dishes;
}
function saveDaily(user, daily){
    var uDaily = user.daily;
    for(var date in daily) if(date){
        var day = new Day(daily[date]);

        var find = false;
        for(var i = 0; i < uDaily.length; i++){
            if(day.date === uDaily[i].date){
                uDaily[i].main = day.main;
                uDaily[i].additional = day.additional;
                find = true;
                break;
            }
        }
        if(!find)
            uDaily.push(day);
    }
}

function save(user, bundle, callback){
    async.series([
        function(cb){
            async.parallel([
                function(cb){
                    saveProductList(user, bundle.productList);
                    return cb(null);
                },
                function(cb){
                    saveDishes(user, bundle.dishList);
                    return cb(null);
                },
                function(cb){
                    saveCurrentDishProducts(user, bundle.dishProductList);
                    return cb(null);
                },
                function(cb){
                    saveDaily(user, bundle.daily);
                    return cb(null);
                }
            ], cb);
        },
        function(cb){
            saveUser(user, function(err) {
                if (err) return cb(err);
                cb(null, user);
            });
        }
    ], callback);
}

module.exports = {
    getDaily: getDaily,
    getCurrentDate: getCurrentDate,
    setCurrentDateAndGetDaily: setCurrentDateAndGetDaily,
    getNormAndBody: getNormAndBody,
    setNormAndBody: setNormAndBody,
    getBundle: getBundle,
    saveUser: saveUser,
    save: save,
    saveCurrentDishProducts: saveCurrentDishProducts,
    saveProductList: saveProductList,
    saveDishes: saveDishes,
    saveDaily: saveDaily
};

/*
function socketSetupHandles(user){

    var save = function(deferredCaller, user){
        //deferredCaller.tryToCall(saveUser.bind(null, user))
    }.bind(null, new DeferredCaller(5000), user);

    socket
        .on('error', function(err){
            logger.error(err);
        })
        .on('disconnect', function () {
            logger.info('disconnected');
        })

        .on('saveCurrentDishProducts',  saveCurrentDishProducts.bind(null, user))
        .on('saveProductList',          saveProductList.bind(null, user))
        .on('saveDishes',               saveDishes.bind(null, user))
        .on('saveDaily',                saveDaily.bind(null, user))

        .on('getDaily',                 getDaily.bind(null, user))
        .on('setCurrentDate',           setCurrentDate.bind(null, user, save))
        .on('getCurrentDate',           getCurrentDate.bind(null, user))

        .on('bundle',                   getBundle.bind(null, user))

        .on('getBody', getBody.bind(null, user))
        .on('setBody', setBody.bind(null, user, save))

        .on('getNorm', getNorm.bind(null, user))
        .on('setNorm', setNorm.bind(null, user, save))

        .on('justSave', function(){
            saveUser(user, function(err){
                if(err) socket.emit('error', err);
                else socket.emit('save');
            });
        })
        .on('save', function(bundle){

            async.series([
                function(cb){
                    async.parallel([
                        function(cb){
                            saveProductList(user, bundle.productList);
                            return cb(null);
                        },
                        function(cb){
                            saveDishes(user, bundle.dishList);
                            return cb(null);
                        },
                        function(cb){
                            saveCurrentDishProducts(user, bundle.dishProductList);
                            return cb(null);
                        },
                        function(cb){
                            saveDaily(user, bundle.daily);
                            return cb(null);
                        },
                    ], cb);
                },
                function(cb){
                    saveUser(user, cb);
                }
            ], function(err){
                if(err) {
                    logger.error('Some problem with saving', user && user.username, err);
                    socket.emit('error', err);
                }else{
                    logger.info(user && user.username, 'saved');
                    socket.emit('save');
                }
            });
        })
}*/
