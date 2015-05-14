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
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get('/list', function(req, res) {
    res.send(products.list);
});
router.post('/newProduct', function(req, res) {
    var newProduct = req.body;

    products.push(newProduct);
    products.save();
    res.end();
});
router.post('/removeProduct', function(req, res) {
    var id = req.body.id;

    products.remove(id);
    products.save();
    res.end();
});
router.get('/daily', function(req, res) {
    var date = req.query.date;
    res.send(products.getDaily(date));
});
router.post('/daily', function(req, res) {
    var dailyProduct = req.body;

    products.addDaily(dailyProduct.date, dailyProduct.products);
    products.save();
    res.end();
});

router.post('/currentDishProducts', function(req, res) {
    products.currentDishProducts = req.body.currentDishProducts;

    products.save();
    res.end();
});
router.get('/currentDishProducts', function(req, res) {
    res.send(products.currentDishProducts);
});


module.exports = router;
