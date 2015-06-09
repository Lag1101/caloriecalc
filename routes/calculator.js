var express = require('express');
var router = express.Router();
var config = require('../config');
var env = config.get('NODE_ENV');
var User = require('../models/user').User;

/* GET home page. */
router.get('/', function(req, res) {
    User.findOne({username: req.session.username}, function(err, user){
        if(err) throw err;

        var p = {
            title: config.get('title'),
            user: user
        };
        res.render('index', p);
    });

});


module.exports = router;
