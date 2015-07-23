/**
 * Created by vasiliy.lomanov on 28.04.2015.
 */

var intel = require('intel');

intel.basicConfig({
    'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
    'strip': true,
    'colorize': true
});

module.exports = intel;
