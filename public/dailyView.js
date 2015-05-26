/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

(function(socket){

    var resultView = $('.result');
    var daily = $('.daily');
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
    daily.find('.item').on('input paste',function(){
        reCalcDaily();
        saveDaily();
    });

    daily.find('.addButton').click(function(){
        var newItem = getNewItemClone();
        Product.emptyProduct.writeEl(daily.find('.newItem'));
        updateLinks();
        reCalcDaily();
        saveDaily();
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
            var field = resultView.find('.'+fieldName).removeClass('normal underNorm overNorm');

            if      (cur[fieldName] >= norms.max[fieldName]) field.addClass('overNorm');
            else if (cur[fieldName] < norms.min[fieldName]) field.addClass('underNorm');
            else                                            field.addClass('normal');

        }
    }

    daily.find('input').on('input paste', function(){
        $(this).val( utils.validate( $(this).val() ) );
    });

    socket.emit('getCurrentDate');
    socket.on('getCurrentDate', function(date){
        dailyDate.val(date);
        responseDaily(dailyDate.val());
        reCalcDaily();
    });

    dailyDate.on('input propertychange paste', function(){
        var date = $(this).val();
        socket.emit('setCurrentDate', date);
        responseDaily(date);
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
            $(this).detach();
        });

        updateLinks();
    }
    function getNewItemClone(){
        var newItem = $('<div>')
            .append($('<div>')
                //.append($('<button>').addClass('add item').text('+'))
                .append($('<button>').addClass('remove btn myLabel btn-xs btn-primary').append(utils.icons.remove.clone()))
                .append($('<div>').attr('contenteditable', true).addClass('description item enableForInput'))
                .append($('<input>').addClass('proteins'))
                .append($('<input>').addClass('triglyceride'))
                .append($('<input>').addClass('carbohydrate'))
                .append($('<input>').addClass('calorie'))
                .append($('<div>').attr('contenteditable', true).addClass('details item enableForInput'))
                .addClass('additionalProduct product'));
            //.append($('<button>').addClass('remove item').text('-')));

        newItem.find('input').addClass('item');

        newItem.find('.remove').click(utils.removeFromCurrentDish.bind(null, newItem, function(){
            updateLinks();
            reCalcDaily();
            saveDaily();
        }));
        newItem.find('.item').on('input paste', function(){
            reCalcDaily();
            saveDaily();
        });
        newItem.find('input:not(.description)').on('input paste', function(){
            $(this).val( utils.validate( $(this).val() ) );
        });
        //newItem.find('.daily').val(daily.find('.newItem').find('.daily').val())
        newItem.find('.details').on('input paste', function(){
            saveDaily();
        });
        daily.find('.newItem').before(newItem);

        return newItem;
    }

    function updateLinks(){
        links.proteins = daily.find('.proteins:not(.notCalc)');
        links.triglyceride = daily.find('.triglyceride:not(.notCalc)');
        links.carbohydrate = daily.find('.carbohydrate:not(.notCalc)');
        links.calorie = daily.find('.calorie:not(.notCalc)');
    }

    function restoreDaily(dailyProducts){
        restoreDailyItem(daily.find('.breakfast'), dailyProducts.breakfast || {});
        restoreDailyItem(daily.find('.firstLunch'), dailyProducts.firstLunch || {});
        restoreDailyItem(daily.find('.secondLunch'), dailyProducts.secondLunch || {});
        restoreDailyItem(daily.find('.thirdLunch'), dailyProducts.thirdLunch || {});
        restoreDailyItem(daily.find('.dinner'), dailyProducts.dinner || {});
        restoreDailyItem(daily.find('.secondDinner'), dailyProducts.secondDinner || {});

        if(dailyProducts.additional) {
            for (var i = 0; i < dailyProducts.additional.length; i++) {
                var additional = dailyProducts.additional[i];
                var additionalItem = getNewItemClone();
                restoreDailyItem(additionalItem, additional || {});
            }
            updateLinks();
        }
    }


    socket.on('getDaily', function (data) {
        if(data)
            restoreDaily(data);
        updateLinks();
        reCalcDaily();
    });
    function responseDaily(date) {
        clearDaily();
        socket.emit('getDaily', date);
    }

    function createDailyItem(el){
        var product = new Product();
        product.readEl(el);
        return {
            products: product.getRaw()
        };
    }

    function restoreDailyItem(el, details){
        var product = new Product(details.products);
        product.writeEl(el);
    }

    function saveDaily(){
        var date = dailyDate.val();

        var products = {
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

        var data = {
            date: date,
            products: products
        };
        socket.emit('setDaily', data);
    }
})(socket);