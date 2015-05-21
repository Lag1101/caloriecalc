/**
 * Created by vasiliy.lomanov on 15.05.2015.
 */

var products = require('../products').products;
products.load(function(err, list){
    if(err)
        console.error(err);
    else
        console.log(list);
});

module.exports = function(server){
    var io = require('socket.io').listen(server);

    io.on('connection', function(socket){
        console.info(socket.id, 'socket connected');
        socket
            .on('disconnect', function () {
                console.info('disconnected');
            })
            .on('list', function(){
                socket.emit('list', products.list);
            })
            .on('newProduct', function(newProduct){
                products.push(newProduct);
                products.save();
            })
            .on('removeProduct', function(id){
                products.remove(id);
                products.save();
            })
            .on('getDaily', function(date){
                socket.emit('getDaily', products.getDaily(date));
            })
            .on('setDaily', function(dailyProduct){
                products.addDaily(dailyProduct.date, dailyProduct.products);
                products.save();
            })
            .on('getCurrentDishProducts', function(){
                socket.emit('getCurrentDishProducts', products.currentDish);
            })
            .on('setCurrentDishProducts', function(currentDish){
                products.currentDish = currentDish;
                products.save();
            })
            .on('getCurrentDate', function(){
                socket.emit('getCurrentDate', products.date);
            })
            .on('setCurrentDate', function(date){
                products.date = date;
                products.save();
            })
            .on('setDishList', function(dishList){
                products.dishList = dishList;
                products.save();
            })
            .on('getDishList', function(dishList){
                socket.emit('getDishList', products.dishList);
            });
    });
};