/**
 * Created by luckybug on 12.04.15.
 */


var mongoose = require('mongoose');
var config = require('../config');
var logger = require('../lib/logger');

logger.info("Connecting to " + config.get('mongoose:uri'));
mongoose.connect(config.get('mongoose:uri'));

mongoose.connection.on('error', function(err) {
    logger.error(err.message);

    process.exit(255);
});

module.exports = mongoose;