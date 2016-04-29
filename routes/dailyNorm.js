/**
 * Created by vasiliy.lomanov on 11.06.2015.
 */
var express = require('express');
var router = express.Router();
var config = require('../config');
var User = require('../models/user').User;
var env = config.get('NODE_ENV');
var async = require("async");

var getUser = require("../lib/usersCache").getUser;
var db_methods = require("../lib/db_methods");

/* GET home page. */
router.get('/', function(req, res, next) {
    getUser(req, function(err, user){

        if(err) throw err;

        res.render('dailyNorm', {
            title: config.get('title'),
            devel: env !== 'production',
            user: user
        });
    });
});

router.post('/getNormAndBody', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            db_methods.getNormAndBody(user, cb);
        }
    ], function(err, norm, body){
        if(err) throw err;
        res.send({
            norm: norm,
            body: body
        });
    });
});

router.post('/save', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var body = req.body.data.body;
            var norm = req.body.data.norm;
            db_methods.setNormAndBody(user, norm, body, function(err){
                return cb(err, user);
            });
        },
        function(user, cb){
            db_methods.saveUser(user, cb);
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

module.exports = router;
