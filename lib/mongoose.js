/**
 * Created by luckybug on 12.04.15.
 */


var mongoose = require('mongoose');
var config = require('../config');
var logger = require('../lib/logger');

var env = config.get('NODE_ENV');

var uri = env === 'production' ? config.get('mongoose:uriProduction') : config.get('mongoose:uri');

logger.info("Connecting to " + uri);
mongoose.connect(uri);

mongoose.connection.on('error', function(err) {
    logger.error(err.message);

    process.exit(255);
});

mongoose.connection.once('open', function (callback) {
    logger.info("Connected");
});

module.exports = mongoose;