/**
 * Created by luckybug on 29.04.16.
 */


var User = require('../models/user').User;

var users = {};

function getUser(req, cb){
    if(!users[req.session.username])
        User.findOne({username: req.session.username}, function(err, user){
            users[req.session.username] = user;
            return cb(null, users[req.session.username]);
        });
    else
        return cb(null, users[req.session.username]);
}

module.exports.getUser = getUser;