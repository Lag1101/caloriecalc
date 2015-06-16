/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */
var express = require('express');
var router = express.Router();
var config = require('../config');
var User = require('../models/user').User;
var env = config.get('NODE_ENV');

/* GET home page. */
router.get('/', function(req, res, next) {
    User.findOne({username: req.session.username}, function(err, user){

        if(err) throw err;

        res.render('testPage', {
            title: config.get('title'),
            devel: env !== 'production',
            user: user
        });
    });
});

module.exports = router;
