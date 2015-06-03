/**
 * Created by vasiliy.lomanov on 15.05.2015.
 */

var User = require('../models/user').User;
var Product = require('../models/product').Product;
var Dish = require('../models/dish').Dish;
var async = require('async');
var logger = require('../lib/logger');

function getCurrentDishes(socket, username){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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

function addDish(socket, username, newDish){
    if(!newDish) return;
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
            return getCurrentDishes(socket, username);
        }
    });

}


function removeDish(socket, username, id){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
            return getCurrentDishes(socket, username);
        }
    });
}

function getCurrentDishProducts(socket, username){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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

function newDishProduct(socket, username, newDishProductId){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
            user.addDishProduct(newDishProductId, cb);
        },
        function(user, cb){
            user.save(cb);
        },
        function(user, n, cb){
            getCurrentDishProducts(socket, username);
            return cb();
        }
    ], function(err){
        if(err)
            logger.error(err);
        else
            logger.info('Copied dishProduct', newDishProductId);
    });

}

function removeDishProduct(socket, username, id){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
            return getCurrentDishProducts(socket, username);
        }
    });
}

function getCurrentDate(socket, username){
    User.findOne({username: username}, function(err, user){
        if(err) logger.error(err);

        socket.emit('getCurrentDate', user.date);
    });
}

function setCurrentDate(socket, username, date){
    User.findOne({username: username}, function(err, user){
        if(err) logger.error(err);

        user.date = date;
        user.save(function(){
            getDaily(socket, username);
        });
    });
}
function fixDish(socket, username, fixedDish){
    if(!fixedDish) return;
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
function fixDaily(socket, username, fixedProduct){
    if(!fixedProduct) return;
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
function fixDishProduct(socket, username, fixedProduct){
    if(!fixedProduct) return;
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
function fixProduct(socket, username, fixedProduct){
    if(!fixedProduct) return;
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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

function list(socket, username){
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
        if(err)
            logger.error(err);
        else
        {
            logger.info('Got list');
        }
    });
}

function newProduct(socket, username, newProduct){
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
        if(err)
            logger.error(err);
        else {
            logger.info('Added product', newProduct);
            return list(socket, username);
        }
    });
}
function removeProduct(socket, username, id){
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
        if(err)
            logger.error(err);
        else {
            logger.info('Removed product', id);
            return list(socket, username);
        }
    });
}
function getDaily(socket, username, date){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
function removeDailyProduct(socket, username, dailyItemId){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
            return getDaily(socket, username, user.date);
        }
    });
}
function addDailyProduct(socket, username, newDailyItem){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
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
            return getDaily(socket, username);
        }
    });
}
module.exports = function(server){
    var io = require('socket.io').listen(server);

    var username = 'luckybug';

    io.on('connection', function(socket){
        console.info(socket.id, 'socket connected');

        getCurrentDishes(socket, username);

        socket
            .on('disconnect', function () {
                console.info('disconnected');
            })
            .on('list',                     list.bind(null, socket, username))
            .on('newProduct',               newProduct.bind(null, socket, username))
            .on('removeProduct',            removeProduct.bind(null, socket, username))

            .on('getDaily',                 getDaily.bind(null, socket, username))
            .on('fixDailyProduct',          fixDaily.bind(null, socket, username))
            .on('removeDailyProduct',       removeDailyProduct.bind(null, socket, username))
            .on('addDailyProduct',          addDailyProduct.bind(null, socket, username))

            .on('getCurrentDishProducts',   getCurrentDishProducts.bind(null, socket, username))
            .on('newDishProduct',           newDishProduct.bind(null, socket, username))
            .on('removeDishProduct',        removeDishProduct.bind(null, socket, username))

            .on('getCurrentDate',           getCurrentDate.bind(null, socket, username))
            .on('setCurrentDate',           setCurrentDate.bind(null, socket, username))

            .on('fixProduct',               fixProduct.bind(null, socket, username))
            .on('fixDishProduct',           fixDishProduct.bind(null, socket,  username))

            .on('getCurrentDishes',         getCurrentDishes.bind(null, socket, username))
            .on('addDish',                  addDish.bind(null, socket, username))
            .on('removeDish',               removeDish.bind(null, socket, username))
            .on('fixDish',                  fixDish.bind(null, socket, username))
    });
};