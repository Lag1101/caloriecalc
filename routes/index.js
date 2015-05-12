var express = require('express');
var router = express.Router();
var products = require('../products').products;
products.load(function(err, list){
    if(err)
        console.error(err);
    else
        console.log(list);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/list', function(req, res, next) {
    res.send(products.list);
});
router.post('/newProduct', function(req, res, next) {
    var newProduct = req.body;

    products.push(newProduct);
    products.save();
    res.end();
});
router.post('/removeProduct', function(req, res, next) {
    var product = req.body;

    products.list.map(function(obj, index){
        if(obj.description === product.description)
            products.list.splice(index, 1);
    });
    products.save();
    res.end();
});
router.get('/daily', function(req, res, next) {
    var date = req.query.date;
    res.send(products.getDaily(date));
});
router.post('/daily', function(req, res, next) {
    var dailyProduct = req.body;

    products.addDaily(dailyProduct.date, dailyProduct.products);
    products.save();
    res.end();
});


module.exports = router;
