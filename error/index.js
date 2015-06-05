/**
 * Created by vasiliy.lomanov on 18.02.2015.
 */
var path = require('path');
var util = require('util');
var http = require('http');

// ошибки для выдачи посетителю
function HttpError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || "Error";
}

util.inherits(HttpError, Error);

HttpError.prototype.name = 'HttpError';

module.exports.HttpError = HttpError;