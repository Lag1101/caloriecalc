/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

var checkAuth = require('../middleware/checkAuth');

module.exports = function(app){
    app.use('/', require('./frontpage'));
    app.use('/login', require('./login'));
    app.use('/calculator', checkAuth, require('./calculator'));
    app.use('/logout',checkAuth, require('./logout'));
};