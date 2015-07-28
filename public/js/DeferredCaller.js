/**
 * Created by vasiliy.lomanov on 26.06.2015.
 */
var DeferredCaller = (function(){
    function DeferredCaller(time){
        this.timeoutToCall = null;
        this.time = time;
    }
    DeferredCaller.prototype.tryToCall = function(func, cb){
        if(this.timeoutToCall)
            clearTimeout(this.timeoutToCall);

        this.timeoutToCall = setTimeout(function(){
            var res = func();

            this.timeoutToCall = null;

            console.log('Called!!!');
            return cb && cb(null, res);
        }.bind(this), this.time);
    };
    return DeferredCaller;
})();

if(module && module.exports)
    module.exports = DeferredCaller;