/**
 * Created by vasiliy.lomanov on 28.04.2015.
 */

var logger = require('intel');

logger.config({
    formatters: {
        'simple': {
            'format': '[%(levelname)s] %(message)s',
            'colorize': true
        },
        'details': {
            'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
            'strip': true
        }
    }
});

module.exports = logger;
