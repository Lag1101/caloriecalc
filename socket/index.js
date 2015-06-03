/**
 * Created by vasiliy.lomanov on 15.05.2015.
 */

var User = require('../models/user').User;
var Product = require('../models/product').Product;
var Dish = require('../models/dish').Dish;
var async = require('async');
var logger = require('../lib/logger');

function getCurrentDishes(socket, user){
    async.waterfall([
        function(cb){
            user.getCurrentDishes(cb);
        },
        function(dishes, cb){
            socket.emit('getCurrentDishes', dishes);
            return cb();
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Got dishes');
            //return getCurrentDishes(socket, username);
        }
    });
}

function addDish(socket, user, newDish){
    if(!newDish) return;
    async.waterfall([
        function(cb){
            user.addDish(newDish, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Added dish', newDish);
            return getCurrentDishes(socket, user);
        }
    });

}


function removeDish(socket, user, id){
    async.waterfall([
        function(cb){
            user.removeDish(id, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Removed dish', id);
            return getCurrentDishes(socket, user);
        }
    });
}

function getCurrentDishProducts(socket, user){
    async.waterfall([
        function(cb){
            user.getCurrentDishProducts(cb);
        },
        function(products, cb){
            socket.emit('getCurrentDishProducts', products);
            return cb();
        }
    ], function(err){
        if(err)
            logger.error(err);
        else
        {
            logger.info('Got current dish products');
        }
    });
}

function newDishProduct(socket, user, newDishProductId){
    async.waterfall([
        function(cb){
            user.addDishProduct(newDishProductId, cb);
        },
        function(user, cb){
            user.save(cb);
        },
        function(user, n, cb){
            getCurrentDishProducts(socket, user);
            return cb();
        }
    ], function(err){
        if(err)
            logger.error(err);
        else
            logger.info('Copied dishProduct', newDishProductId);
    });

}

function removeDishProduct(socket, user, id){
    async.waterfall([
        function(cb){
            user.removeDishProduct(id, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Removed product', id);
            return getCurrentDishProducts(socket, user);
        }
    });
}

function getCurrentDate(socket, user){
    socket.emit('getCurrentDate', user.date);
}

function setCurrentDate(socket, user, date){
    if(err) logger.error(err);

    user.date = date;
    user.save(function(){
        getDaily(socket, user);
    });
}
function fixDish(socket, user, fixedDish){
    if(!fixedDish) return;
    async.waterfall([
        function(cb){
            var dish = user.dishes.id(fixedDish.id);
            if(!dish)
                return cb(new Error("Dish doesn't exist"));
            else
                return cb(null, dish, user);
        },
        function(dish, user, cb){
            dish.setFromRaw(fixedDish, function(err){
                return cb(null, user)
            });
        },
        function(user, cb){
            user.save(cb);
        }
    ],function(err){
        if(err)
            logger.error(err);
        else
            logger.info('Saved', fixedDish, err);
    });
}
function fixDaily(socket, user, fixedProduct){
    if(!fixedProduct) return;
    async.waterfall([
        function(cb){
            user.getDailyByDate(user.date, function(err, daily){
                cb(err, daily, user)
            });
        },
        function(daily, user, cb){
            if(!daily)
                return cb(new Error("Daily doesn't exist"));
            daily.fixProduct(fixedProduct, function(err){
                return cb(null, user)
            });
        },
        function(user, cb){
            user.save(cb);
        }
    ],function(err){
        if(err)
            logger.error(err);
        else
            logger.info('Saved', fixedProduct, err);
    });
}
function fixDishProduct(socket, user, fixedProduct){
    if(!fixedProduct) return;
    async.waterfall([
        function(cb){
            var product = user.currentDishProducts.id(fixedProduct.id);
            return cb(null, product, user)
        },
        function(product, user, cb){
            if(!product)
                return cb(new Error("Product doesn't exist"));
            product.setFromRaw(fixedProduct);
            user.save(cb);
        }
    ],function(err){
        if(err)
            logger.error(err);
        else
            logger.info('Saved', fixedProduct, err);
    });
}
function fixProduct(socket, user, fixedProduct){
    if(!fixedProduct) return;
    async.waterfall([
        function(cb){
            var product =user.products.id(fixedProduct.id);
            return cb(null, product, user)
        },
        function(product, user, cb){
            if(!product)
                return cb(new Error("Product doesn't exist"));
            product.setFromRaw(fixedProduct);
            user.save(cb);
        }
    ],function(err){
        if(err)
            logger.error(err);
        else
            logger.info('Saved', fixedProduct, err);
    });
}

function list(socket, user){
    async.waterfall([
        function(cb){
            user.gerRawProductList(cb);
        },
        function(rawProducts, cb){
            socket.emit('list', rawProducts);
            cb();
        }
    ],function(err){
        if(err)
            logger.error(err);
        else
        {
            logger.info('Got list');
        }
    });
}

function newProduct(socket, user, newProduct){
    async.waterfall([
        function(cb){
            user.addProduct(newProduct, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Added product', newProduct);
            return list(socket, user);
        }
    });
}
function removeProduct(socket, id){
    async.waterfall([
        function(cb){
            user.removeProduct(id, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Removed product', id);
            return list(socket, user);
        }
    });
}
function getDaily(socket, user, date){
    async.waterfall([
        function(cb){
            user.getRawDailyByDate(user.date, cb);
        },
        function(rawDaily, cb){
            socket.emit('getDaily', rawDaily);
            cb();
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Got daily', date);
        }
    });

}
function removeDailyProduct(socket, user, dailyItemId){
    async.waterfall([
        function(cb){
            user.removeDailyItem(user.date, dailyItemId, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err, user){
        if(err)
            logger.error(err);
        else {
            logger.info('Removed daily product', dailyItemId);
            return getDaily(socket, user, user.date);
        }
    });
}
function addDailyProduct(socket, user, newDailyItem){
    async.waterfall([
        function(cb){
            user.newDailyItem(user.date, newDailyItem, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err)
            logger.error(err);
        else {
            logger.info('Added daily product', newDailyItem);
            return getDaily(socket, user);
        }
    });
}
module.exports = function(server){
    var io = require('socket.io').listen(server);

    var username = 'luckybug';

    io.on('connection', function(socket){
        console.info(socket.id, 'socket connected');

        User.findOne({username: username}, function(err, user){
            if(err || !user)
                return new Error(err);

            socket
                .on('disconnect', function () {
                    console.info('disconnected');
                })
                .on('list',                     list.bind(null, socket, user))
                .on('newProduct',               newProduct.bind(null, socket, user))
                .on('removeProduct',            removeProduct.bind(null, socket, user))

                .on('getDaily',                 getDaily.bind(null, socket, user))
                .on('fixDailyProduct',          fixDaily.bind(null, socket, user))
                .on('removeDailyProduct',       removeDailyProduct.bind(null, socket, user))
                .on('addDailyProduct',          addDailyProduct.bind(null, socket, user))

                .on('getCurrentDishProducts',   getCurrentDishProducts.bind(null, socket, user))
                .on('newDishProduct',           newDishProduct.bind(null, socket, user))
                .on('removeDishProduct',        removeDishProduct.bind(null, socket, user))

                .on('getCurrentDate',           getCurrentDate.bind(null, socket, user))
                .on('setCurrentDate',           setCurrentDate.bind(null, socket, user))

                .on('fixProduct',               fixProduct.bind(null, socket, user))
                .on('fixDishProduct',           fixDishProduct.bind(null, socket,  user))

                .on('getCurrentDishes',         getCurrentDishes.bind(null, socket, user))
                .on('addDish',                  addDish.bind(null, socket, user))
                .on('removeDish',               removeDish.bind(null, socket, user))
                .on('fixDish',                  fixDish.bind(null, socket, user))
        });

    });
};