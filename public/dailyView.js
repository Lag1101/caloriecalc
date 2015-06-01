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

    Product.emptyProduct.writeEl(daily.find('.newItem'));
    updateLinks();

    daily.find('.addButton').click(function(){

        var p = new Product();
        p.readEl(newItem);
        socket.emit('addDailyProduct', p);

        Product.emptyProduct.writeEl(newItem);
        //saveDaily();
    });

    function changeBusyState(busy){
        if(busy)
            state.text('Обновление...');
        else
            state.text('Готово');
    }

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

    function clearDaily(){
        Product.emptyProduct.writeEl(daily.find('.breakfast'));
        Product.emptyProduct.writeEl(daily.find('.firstLunch'));
        Product.emptyProduct.writeEl(daily.find('.secondLunch'));
        Product.emptyProduct.writeEl(daily.find('.thirdLunch'));
        Product.emptyProduct.writeEl(daily.find('.dinner'));
        Product.emptyProduct.writeEl(daily.find('.secondDinner'));

        daily.find('.additionalProduct').each(function(){
            $(this).empty();
            $(this).detach();
        });

        updateLinks();
    }


    function updateLinks(){
        links.proteins = daily.find('.proteins:not(.notCalc)');
        links.triglyceride = daily.find('.triglyceride:not(.notCalc)');
        links.carbohydrate = daily.find('.carbohydrate:not(.notCalc)');
        links.calorie = daily.find('.calorie:not(.notCalc)');
    }

    function restoreDaily(dailyProducts){
        restoreDailyItem(daily.find('.breakfast'), dailyProducts.breakfast);
        restoreDailyItem(daily.find('.firstLunch'), dailyProducts.firstLunch);
        restoreDailyItem(daily.find('.secondLunch'), dailyProducts.secondLunch);
        restoreDailyItem(daily.find('.thirdLunch'), dailyProducts.thirdLunch);
        restoreDailyItem(daily.find('.dinner'), dailyProducts.dinner);
        restoreDailyItem(daily.find('.secondDinner'), dailyProducts.secondDinner);

        if(dailyProducts.additional) {
            for (var i = 0; i < dailyProducts.additional.length; i++) {
                var additional = dailyProducts.additional[i];

                var clone = newItem.clone();
                clone.removeClass('newItem').addClass('additionalProduct');
                clone.find('.addButton')
                    .off('click')
                    .removeClass('addButton')
                    .addClass('remove')
                    .text('-');
                newItem.before(clone);
                restoreDailyItem(clone, additional);
            }
            updateLinks();
        }
    }


    socket.on('getDaily', function (data) {
        if(data){
            changeBusyState(false);
            clearDaily();
            restoreDaily(data);
            updateLinks();
            reCalcDaily();
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

        el.find('.remove').off('click').click(utils.removeFromCurrentDish.bind(null, el, function(){
            socket.emit('removeDailyProduct', product.id);
            //saveDaily();
        }));

        el.find('input').off('input paste').on('input paste', function(){
            $(this).val( utils.validate( $(this).val() ) );
            reCalcDaily();
            fixProduct(el, product);
        });
        el.find('.item').off('input paste').on('input paste', function(){
            reCalcDaily();
            fixProduct(el, product);
        });
        //newItem.find('.daily').val(daily.find('.newItem').find('.daily').val())
    }

    function saveDaily(){
        var date = dailyDate.val();

        var products = {
            date: date,
            breakfast: createDailyItem(daily.find('.breakfast')),
            firstLunch: createDailyItem(daily.find('.firstLunch')),
            secondLunch: createDailyItem(daily.find('.secondLunch')),
            thirdLunch: createDailyItem(daily.find('.thirdLunch')),
            dinner: createDailyItem(daily.find('.dinner')),
            secondDinner: createDailyItem(daily.find('.secondDinner')),
            additional: []
        };

        daily.find('.additionalProduct').each(function(){
            products.additional.push(createDailyItem($(this)));
        });

        //clearTimeout(timeOutToSendChanges);
        //changeBusyState(false);
        //timeOutToSendChanges = setTimeout(function(){
        //    socket.emit('setDaily', products);
        //    changeBusyState(false);
        //}, msToSendChanges);
    }
})(socket);