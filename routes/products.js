var express = require('express');
var router = express.Router();
var products = require('../products').products;

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send(products);
});

module.exports = router;
