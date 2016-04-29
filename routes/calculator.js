var express = require('express');
var router = express.Router();
var config = require('../config');
var env = config.get('NODE_ENV');
var User = require('../models/user').User;
var db_methods = require("../lib/db_methods");
var logger = require("../lib/logger");
var async = require("async");
var getUser = require("../lib/usersCache").getUser;

/* GET home page. */
router.get('/', function(req, res) {
    getUser(req, function(err, user){
        if(err) throw err;

        var p = {
            title: config.get('title'),
            devel: env !== 'production',
            user: user
        };
        res.render('index', p);
    });
});

router.post('/saveCurrentDishProducts', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var dishes = req.body.data;
            db_methods.saveCurrentDishProducts(user, dishes);
            return cb();
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

router.post('/saveProductList', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var list = req.body.data;
            db_methods.saveProductList(user, list);
            return cb();
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

router.post('/saveDishes', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var data = req.body.data;
            db_methods.saveDishes(user, data);
            return cb();
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

router.post('/saveDaily', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var data = req.body.data;
            db_methods.saveDaily(user, data);
            return cb();
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

router.post('/getDaily', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var date = req.body.data;
            db_methods.getDaily(user, date, cb);
        }
    ], function(err, daily){
        if(err) throw err;
        res.send(daily);
    });
});

router.post('/setCurrentDate', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var date = req.body.data;
            db_methods.setCurrentDateAndGetDaily(user, date, cb);
        }
    ], function(err, daily){
        if(err) throw err;
        res.send(daily);
    });
});

router.post('/getCurrentDate', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            db_methods.getCurrentDate(user, cb);
        }
    ], function(err, date){
        if(err) throw err;
        res.send(date);
    });
});

router.post('/bundle', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            db_methods.getBundle(user, cb);
        }
    ], function(err, bundle){
        if(err) {
            logger.error(err);
            throw err;
        }
        res.send(bundle);
    });
});

router.post('/getBody', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            db_methods.getBody(user, cb);
        }
    ], function(err, body){
        if(err) throw err;
        res.send(body);
    });
});

router.post('/getNorm', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            db_methods.getNorm(user, cb);
        }
    ], function(err, norm){
        if(err) throw err;
        res.send(norm);
    });
});


router.post('/justSave', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            db_methods.saveUser(user, cb);
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

router.post('/save', function(req, res) {
    async.waterfall([
        function(cb){
            getUser(req, cb);
        },
        function(user, cb) {
            var bundle = JSON.parse(req.body.data);
            db_methods.save(user, bundle, cb);
        }
    ], function(err){
        if(err) throw err;
        res.send({});
    });
});

module.exports = router;
