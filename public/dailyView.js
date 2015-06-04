/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

(function(socket){

    var msToSendChanges = 1 * 1000;
    var timeOutToSendChanges = null;
    var resultView = $('.result');
    var daily = $('.daily');
    var state = daily.find('.state');
    var newItem = daily.find('.newItem');
    var links = {
        proteins: null,
        triglyceride: null,
        carbohydrate: null,
        calorie: null
    };
    var dailyDate = $('.dailyDate');
    var normViews = {
        min: $('.minimum'),
        max: $('.maximum')
    };

    newItem.find('input').off('input paste').on('input paste', function(){
        $(this).val( utils.validate( $(this).val() ) );
        reCalcDaily();
    });
    Product.emptyProduct.writeEl(newItem);
    updateLinks();

    daily.find('.addButton').click(function(){

        var p = new Product();
        p.readEl(newItem);
        socket.emit('addDailyProduct', p);

        Product.emptyProduct.writeEl(newItem);
        //saveDaily();
    });

    function checkNorm(){
        var norms = {
            min: new Product(),
            max: new Product()
        };

        norms.min.readEl(normViews.min);
        norms.max.readEl(normViews.max);

        var cur = new Product();
        cur.readEl(resultView);

        var fields = ['proteins', 'triglyceride', 'carbohydrate', 'calorie'];

        for(var i = 0; i < fields.length; i++) {
            var fieldName = fields[i];
            var field = resultView.find('.'+fieldName).removeClass('label-danger');

            if (cur[fieldName] >= norms.max[fieldName]) field.addClass('label-danger');

        }
    }

    daily.find('input').on('input paste', function(){
        $(this).val( utils.validate( $(this).val() ) );
    });

    socket.emit('getCurrentDate');
    socket.on('getCurrentDate', function(date){
        dailyDate.val(date);
        responseDaily(dailyDate.val());
        updateLinks();
        reCalcDaily();
    });

    dailyDate.on('input propertychange paste', function(){
        var date = $(this).val();
        socket.emit('setCurrentDate', date);
    });

    function reCalcDaily(){
        var res = new Product();
        links.proteins.each(function(){
            res.proteins += +$(this).val();
        });
        links.triglyceride.each(function () {
            res.triglyceride += +$(this).val();
        });
        links.carbohydrate.each(function () {
            res.carbohydrate += +$(this).val();
        });
        links.calorie.each(function () {
            res.calorie += +$(this).val();
        });

        res.writeEl(resultView);

        checkNorm();
    }

    function clearDaily(cb){

        async.parallel([
            function(cb){
                async.eachSeries(Day.fields, function (field, cb) {
                    Product.emptyProduct.writeEl(daily.find('.'+field));
                    return cb();
                }, cb);
            },
            function(cb){
                daily.find('.additionalProduct').each(function(){
                    $(this).empty();
                    $(this).detach();
                });
                return cb();
            }
        ], function(err){
            updateLinks();
            return cb && cb(err);
        });
    }


    function updateLinks(){
        links.proteins = daily.find('.proteins:not(.notCalc)');
        links.triglyceride = daily.find('.triglyceride:not(.notCalc)');
        links.carbohydrate = daily.find('.carbohydrate:not(.notCalc)');
        links.calorie = daily.find('.calorie:not(.notCalc)');
    }

    function restoreDaily(newDay, cb){

        var dailyProducts = new Day(newDay);

        async.parallel([
            function(cb) {
                async.eachSeries(Day.fields, function (field, cb) {
                    restoreDailyItem(daily.find('.'+field), dailyProducts[field]);
                    return cb();
                }, cb)
            },
            function(cb){
                async.eachSeries(dailyProducts.additional, function(additional, cb){
                    var clone = newItem.clone();
                    clone.removeClass('newItem').addClass('additionalProduct');
                    clone.find('.addButton')
                        .off('click')
                        .removeClass('addButton')
                        .addClass('remove')
                        .text('-');
                    newItem.before(clone);
                    restoreDailyItem(clone, additional);
                    return cb();
                }, cb);
            }
        ], function(err){
            if(err)
                return cb(err);
            return cb();
        });
    }


    socket.on('getDaily', function (data) {
        if(data){
            clearDaily(function(){
                restoreDaily(data, function(err){
                    if(err)
                        console.error(err);
                    else{
                        updateLinks();
                        reCalcDaily();
                    }
                });
            });

        }
    });
    function responseDaily(date) {
        socket.emit('getDaily', date);
    }

    function createDailyItem(el){
        var product = new Product();
        product.readEl(el);
        return product.getRaw();
    }

    function fixProduct(el, product){
        var fixedProduct = new Product();
        fixedProduct.readEl(el);
        fixedProduct.id = product.id;
        socket.emit('fixDailyProduct', fixedProduct);
    }

    function restoreDailyItem(el, details){
        var product = new Product(details);
        product.writeEl(el);

        el.find('.remove').off('click').click(function(){
            el.detach();
            socket.emit('removeDailyProduct', product.id);
            reCalcDaily();
            //saveDaily();
        });

        el.find('.description .details').off('input paste').on('input paste', function(){
            reCalcDaily();
            fixProduct(el, product);
        });
        el.find('.item').off('input paste').on('input paste', function(){
            $(this).val( utils.validate( $(this).val() ) );
            reCalcDaily();
            fixProduct(el, product);
        });
        //newItem.find('.daily').val(daily.find('.newItem').find('.daily').val())
    }

    function saveDaily(){
        var date = dailyDate.val();

        var products = {
            date: date,
            main:[
                createDailyItem(daily.find('.breakfast')),
                createDailyItem(daily.find('.firstLunch')),
                createDailyItem(daily.find('.secondLunch')),
                createDailyItem(daily.find('.thirdLunch')),
                createDailyItem(daily.find('.dinner')),
                createDailyItem(daily.find('.secondDinner'))
            ],
            additional: []
        };

        daily.find('.additionalProduct').each(function(){
            products.additional.push(createDailyItem($(this)));
        });
    }
})(socket);