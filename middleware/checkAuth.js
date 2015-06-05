/**
 * Created by vasiliy.lomanov on 18.02.2015.
 */

var HttpError = require('../error').HttpError;

module.exports = function(req, res, next) {
    if (req.session.username === undefined) {
        return next(new HttpError(401, "Вы не авторизованы"));
    }

    next();
};