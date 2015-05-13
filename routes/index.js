/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */


module.exports = function(app){
    app.use('/', require('./main'));
    app.use('/users', require('./users'));
    app.use('/products', require('./products'));
};