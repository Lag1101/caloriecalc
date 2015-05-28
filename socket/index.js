/**
 * Created by vasiliy.lomanov on 15.05.2015.
 */

var User = require('../models/user').User;
var Product = require('../models/product').Product;
var products = require('../products').products;
var async = require('async');
var logger = require('../lib/logger');

products.load(function(err, list){
    if(err)
        console.error(err);
    else
        console.log(list);
});

module.exports = function(server){
    var io = require('socket.io').listen(server);

    var username = 'luckybug';

    io.on('connection', function(socket){
        console.info(socket.id, 'socket connected');
        socket
            .on('disconnect', function () {
                console.info('disconnected');
            })
            .on('list', function(){
                async.waterfall([
                    function(cb){
                        User.findOne({username: username}, cb);
                    },
                    function(user, cb){
                        user.gerRawProductList(cb);
                    },
                    function(rawProducts, cb){
                        socket.emit('list', rawProducts);
                        cb();
                    }
                ],function(err){
                    if(err) logger.error(err);
                });
            })
            .on('newProduct', function(newProduct){
                async.waterfall([
                    function(cb){
                        User.findOne({username: username}, cb);
                    },
                    function(user, cb){
                        user.addProduct(newProduct, cb);
                    },
                    function(user, cb){
                        user.save(cb);
                    }
                ], function(err){
                    if(err) logger.error(err);
                });
            })
            .on('removeProduct', function(id){
                async.waterfall([
                    function(cb){
                        User.findOne({username: username}, cb);
                    },
                    function(user, cb){
                        user.removeProduct(id, cb);
                    },
                    function(user, cb){
                        user.save(cb);
                    }
                ], function(err){
                    if(err) logger.error(err);
                });
            })
            .on('getDaily', function(date){
                async.waterfall([
                    function(cb){
                        User.findOne({username: username}, cb);
                    },
                    function(user, cb){
                        user.getRawDailyByDate(date, cb);
                    },
                    function(rawDaily, cb){
                        socket.emit('getDaily', rawDaily);
                        cb();
                    }
                ], function(err){
                    if(err) logger.error(err);
                });

            })
            .on('setDaily', function(daily){
                async.waterfall([
                    function(cb){
                        User.findOne({username: username}, cb);
                    },
                    function(user, cb){
                        user.setDaily(daily, function(err, d){
                            cb(err, user);
                        });
                    },
                    function(user, cb){
                        user.save(cb);
                    }
                ], function(err){
                    if(err) logger.error(err);
                });
                //products.addDaily(dailyProduct.date, dailyProduct.products);
                //products.save();
            })
            .on('getCurrentDishProducts', function(){
                socket.emit('getCurrentDishProducts', products.currentDish);
            })
            .on('setCurrentDishProducts', function(currentDish){
                products.currentDish = currentDish;
                products.save();
            })
            .on('getCurrentDate', function(){
                User.findOne({username: username}, function(err, user){
                    if(err) logger.error(err);

                    socket.emit('getCurrentDate', user.date);
                });
            })
            .on('setCurrentDate', function(date){
                User.findOne({username: username}, function(err, user){
                    if(err) logger.error(err);

                    user.date = date;
                    user.save();
                });
            })
            .on('setDishList', function(dishList){
                products.dishList = dishList;
                products.save();
            })
            .on('getDishList', function(dishList){
                socket.emit('getDishList', products.dishList);
            })
            .on('fixProduct', function(fixedProduct){
                if(!fixedProduct) return;
                for(var i = 0; i < products.list.length; i++){
                    if( products.list[i].id == fixedProduct.id ){
                        products.list[i] = fixedProduct;
                        break;
                    }
                }
                products.save();
            });
    });
};