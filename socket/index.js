/**
 * Created by vasiliy.lomanov on 15.05.2015.
 */

var User = require('../models/user').User;
var Product = require('../models/product').Product;
var Dish = require('../models/dish').Dish;
var Day = require('../models/day').Day;
var async = require('async');
var logger = require('../lib/logger');
var DeferredCaller = require('../public/js/DeferredCaller');


function getDaily(socket, user, date){
    async.waterfall([
        function(cb){
            user.getRawDailyByDate(date, cb);
        },
        function(rawDaily, cb){
            socket.emit('getDaily', rawDaily);
            cb();
        }
    ], function(err){
        if(err) {
            logger.error(err);
            socket.emit('error', err);
        }else{
            logger.info('Got daily', date);
        }
    });
}
function getCurrentDate(socket, user){
    socket.emit('getCurrentDate', user.date);

    logger.info('got date', user.date);
}
function setCurrentDate(socket, user, cb, date){
    if(!date) {
        logger.error('Empty date');
        return;
    }

    user.date = date;
    logger.info('set date', date);
    return cb();
}
function getBody(socket, user){
    logger.info('get body', user.body);
    socket.emit('getBody', user.body);
}
function setBody(socket, user, cb, body){
    if(!body) {
        logger.error('Empty body');
        return;
    }

    user.body = body;
    logger.info('set body', body);
    return cb();
}
function getNorm(socket, user){
    socket.emit('getNorm', user.norm);
}
function setNorm(socket, user, cb, norm){
    if(!norm) {
        logger.error('Empty norm');
        return;
    }

    user.norm = norm;
    logger.info('set norm', norm);
    return cb();
}

function getBundle(socket, user){
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
        }
    }, function(err, bundle){
        if(err){
            logger.error(err);
            socket.emit(err);
        } else {
            logger.info('Got bundle');
            socket.emit('bundle', bundle);
        }
    });
}

function saveUser(user, cb){
    logger.info('Try to save', user && user.username);
    if(!user)
        return cb && cb(new Error("Such user doesn't exist"));
    return user.save(cb);
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

        for(var i = 0; i < uDaily.length; i++){
            if(day.date === uDaily[i].date){
                uDaily[i].main = day.main;
                uDaily[i].additional = day.additional;
                break;
            }
        }
    }
}
function socketSetupHandles(socket, user){

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

        .on('getDaily',                 getDaily.bind(null, socket, user))
        .on('setCurrentDate',           setCurrentDate.bind(null, socket, user, save))
        .on('getCurrentDate',           getCurrentDate.bind(null, socket, user))

        .on('bundle',                   getBundle.bind(null, socket, user))

        .on('getBody', getBody.bind(null, socket, user))
        .on('setBody', setBody.bind(null, socket, user, save))

        .on('getNorm', getNorm.bind(null, socket, user))
        .on('setNorm', setNorm.bind(null, socket, user, save))

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
}

module.exports = function(server, session){
    var ios = require('socket.io-express-session');
    var io = require('socket.io').listen(server);
    io.use(ios(session)); // session support

    io.on('connection', function(socket){
        logger.info(socket.id, 'socket connected', 'session', socket.handshake.session);
        var username = socket.handshake.session.username;

        User.findOne({username: username}, function (err, user) {
            if (err || !user)
                return new Error(err);
            socketSetupHandles(socket, user);
        });

    });
};