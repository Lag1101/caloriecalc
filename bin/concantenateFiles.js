/**
 * Created by vasiliy.lomanov on 02.06.2015.
 */

var logger = require('../lib/logger');

var compressor = require('node-minify');

new compressor.minify({
    type: 'sqwish',
    fileIn: [
        './public/stylesheets/style.css',
        './public/bower_components/bootstrap/dist/css/bootstrap.min.css',
        './public/bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
        "./public/bower_components/bootstrap-dialog/dist//css/bootstrap-dialog.min.css"
    ],
    fileOut: './public/stylesheets/main.css',
    callback: function(err, min){
        if(err)
            logger.error(err);
        else
            logger.info('Release style created');
    }
});