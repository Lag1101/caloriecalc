/**
 * Created by vasiliy.lomanov on 18.02.2015.
 */

var AuthError = require('../models/user').AuthError;

module.exports = function(req, res, next) {
    if (req.session.username === undefined) {
        return next(new AuthError("вы не авторизованны"));
    }

    next();
};