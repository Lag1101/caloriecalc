/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

var checkAuth = require('../middleware/checkAuth');

module.exports = function(app){
    app.use('/', require('./frontpage'));
    app.use('/login', require('./login'));
    app.use('/registration', require('./registration'));
    app.use('/calculator', checkAuth, require('./calculator'));
    app.use('/logout',checkAuth, require('./logout'));
    app.use('/dailyNorm',checkAuth, require('./dailyNorm'));

    app.use('/testPage',checkAuth, require('./testPage'));

    app.use('_ah/', require('./appengine-handlers'));
};