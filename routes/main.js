var express = require('express');
var router = express.Router();
var config = require('../config');
var env = config.get('NODE_ENV');
var cacheTime = config.get('cacheExpireTimeSecs');

/* GET home page. */
router.get('/', function(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=' + cacheTime);

    var p = {
        title: 'CalorieCalc',
        devel: env === 'production'
    };
    res.render('index', p);
});


module.exports = router;
