/**
 * Created by vasiliy.lomanov on 15.05.2015.
 */

var User = require('../models/user').User;
var Product = require('../models/product').Product;
var DishProduct = require('../models/product').DishProduct;
var products = require('../products').products;
var async = require('async');
var logger = require('../lib/logger');

products.load(function(err, list){
    if(err)
        console.error(err);
    else
        console.log(list);
});

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
        if(err) logger.error(err);
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
        }
    ], function(err){
        if(err)
            logger.error(err);
        else
            getCurrentDishProducts(socket, username);
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
        else
            getCurrentDishProducts(socket, username);
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
        user.save();
    });
}

function setDishList(socket, username, dishList){
    products.dishList = dishList;
    products.save();
}

function getDishList(socket, username, dishList){
    socket.emit('getDishList', products.dishList);
}

function fixProduct(socket, username, model, fixedProduct){
    if(!fixedProduct) return;

    async.waterfall([
        function(cb){
            model.findById(fixedProduct.id, cb);
        },
        function(product, cb){
            product.setFromRaw(fixedProduct);
            return product.save(cb);
        }
    ],
    function(err){
        if(err) logger.error(err);
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
        if(err) logger.error(err);
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
        else
            return list(socket, username);
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
        else
            return list(socket, username);
    });
}
function getDaily(socket, username, date){
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

}
function setDaily(socket, username, daily){
    async.waterfall([
        function(cb){
            User.findOne({username: username}, cb);
        },
        function(user, cb){
            user.setDaily(daily, cb);
        },
        function(user, cb){
            user.save(cb);
        }
    ], function(err){
        if(err) logger.error(err);
    });
}

module.exports = function(server){
    var io = require('socket.io').listen(server);

    var username = 'luckybug';

    io.on('connection', function(socket){
        console.info(socket.id, 'socket connected');
        socket
            .on('disconnect', function () {
                console.info('disconnected');
            })
            .on('list',                     list.bind(null, socket, username))
            .on('newProduct',               newProduct.bind(null, socket, username))
            .on('removeProduct',            removeProduct.bind(null, socket, username))
            .on('getDaily',                 getDaily.bind(null, socket, username))
            .on('setDaily',                 setDaily.bind(null, socket, username))
            .on('getCurrentDishProducts',   getCurrentDishProducts.bind(null, socket, username))
            .on('newDishProduct',           newDishProduct.bind(null, socket, username))
            .on('removeDishProduct',        removeDishProduct.bind(null, socket, username))
            .on('getCurrentDate',           getCurrentDate.bind(null, socket, username))
            .on('setCurrentDate',           setCurrentDate.bind(null, socket, username))
            .on('setDishList',              setDishList.bind(null, socket, username))
            .on('getDishList',              getDishList.bind(null, socket, username))
            .on('fixProduct',               fixProduct.bind(null, socket, username, Product))
            .on('fixDishProduct',           fixProduct.bind(null, socket,  username, DishProduct))
    });
};