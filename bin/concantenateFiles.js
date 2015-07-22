/**
 * Created by vasiliy.lomanov on 02.06.2015.
 */

var logger = require('../lib/logger');

var compressor = require('node-minify');

new compressor.minify({
    type: 'sqwish',
    fileIn: [
        './public/stylesheets/style.css'
        //'./public/bower_components/bootstrap/dist/css/bootstrap.min.css',
        //'./public/bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
        //"./public/bower_components/bootstrap-dialog/dist//css/bootstrap-dialog.min.css"
    ],
    fileOut: './public/Release/style.css',
    callback: function(err, min){
        if(err)
            logger.error(err);
        else
            logger.info('Release style created');
    }
});

//new compressor.minify({
//    type: 'uglifyjs',
//    fileIn: [
//        "./public/bower_components/jquery/dist/jquery.min.js",
//        "./public/bower_components/socket.io-client/socket.io.js",
//        "./public/bower_components/bootstrap/dist/js/bootstrap.min.js",
//        "./public/bower_components/async/lib/async.js",
//        "./public/bower_components/bootstrap-dialog/dist/js/bootstrap-dialog.min.js"
//    ],
//    fileOut: './public/Release/3rdParty.js',
//    callback: function(err, min){
//        if(err)
//            logger.error(err);
//        else
//            logger.info('Release 3rdParty created');
//    }
//});

new compressor.minify({
    type: 'uglifyjs',
    fileIn: [
        './public/socket.js',
        './public/js/PrefixTree.js',
        './public/js/DeferredCaller.js',
        './public/utils.js',
        './public/product.js',
        './public/dish.js',
        './public/day.js',
        './public/dailyView.js',
        './public/products.js',
        './public/components/build/Input.react.js',
        './public/components/build/Sorting.react.js',
        './public/components/build/Product.react.js',
        './public/components/build/ProductList.react.js',
        './public/components/build/DishProductList.react.js'
    ],
    fileOut: './public/Release/index.js',
    callback: function(err, min){
        if(err)
            logger.error(err);
        else
            logger.info('Release index created');
    }
});
