var express = require('express');
var router = express.Router();
var env = require('../config').get('NODE_ENV');

/* GET home page. */
router.get('/', function(req, res) {
    var p = {
        title: 'CalorieCalc',
        devel: env === 'production'
    };
    res.render('index', p);
});


module.exports = router;
