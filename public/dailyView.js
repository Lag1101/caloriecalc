/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

(function(){

    var daily = $('.daily');
    var links = {
        proteins: null,
        triglyceride: null,
        carbohydrate: null,
        calorie: null
    };
    var dailyDate = $('.dailyDate');

    updateLinks();

    daily.find('input').on('input paste',function(){
        reCalcDaily();
        saveDaily();
    });
    var dailyTextAreas = daily.find('textarea');
    dailyTextAreas.on('input paste',function(){
        saveDaily();
    });

    $('.addButton').click(function(){
        var newItem = getNewItemClone();
        daily.find('.newItem').find('input').val('');
        daily.find('.newItem').find('textarea').val('');
        updateLinks();
        reCalcDaily();
        saveDaily();
    });

    daily.find('input:not(.description)').on('input paste', function(){
        $(this).val( utils.validate( $(this).val() ) );
    });

    (function(){
        dailyDate.val(utils.fromDateToString());
        responseDaily(dailyDate.val());
        reCalcDaily();
    })();

    dailyDate.on('input propertychange paste', function(){
        var date = $(this).val();
        responseDaily(date);
    });

    function reCalcDaily(){
        var res = {
            proteins: 0,
            triglyceride: 0,
            carbohydrate: 0,
            calorie: 0
        };
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
        res.proteins = res.proteins.toFixed(1);
        res.triglyceride = res.triglyceride.toFixed(1);
        res.carbohydrate = res.carbohydrate.toFixed(1);
        res.calorie = res.calorie.toFixed(1);

        var resEl = $('.result');
        utils.setProductP(resEl, res);
    }

    function clearDaily(){
        utils.setProductInput(daily.find('.breakfast'), {});
        utils.setProductInput(daily.find('.firstLunch'), {});
        utils.setProductInput(daily.find('.secondLunch'), {});
        utils.setProductInput(daily.find('.thirdLunch'), {});
        utils.setProductInput(daily.find('.dinner'), {});
        utils.setProductInput(daily.find('.secondDinner'), {});

        daily.find('.additionalProduct:not(.newItem)').each(function(){
            $(this).detach();
        });

        updateLinks();
    }
    function getNewItemClone(){
        var newItem = daily.find('.newItem').clone();
        newItem.find('button').text('-');
        newItem.find('button').click(utils.removeFromCurrentDish.bind(null, newItem, function(){
            updateLinks();
            reCalcDaily();
            saveDaily();
        }));
        newItem.removeClass('newItem');
        newItem.find('input').on('input paste', function(){
            reCalcDaily();
            saveDaily();
        });
        newItem.find('input:not(.description)').on('input paste', function(){
            $(this).val( utils.validate( $(this).val() ) );
        });
        newItem.find('textarea').val(daily.find('.newItem').find('textarea').val())
        newItem.find('textarea').on('input paste', function(){
            saveDaily();
        });
        daily.find('.newItem').before(newItem);

        return newItem;
    }

    function updateLinks(){
        links.proteins = daily.find('.proteins');
        links.triglyceride = daily.find('.triglyceride');
        links.carbohydrate = daily.find('.carbohydrate');
        links.calorie = daily.find('.calorie');
    }

    function restoreDaily(dailyProducts){
        restoreDailyItem(daily.find('.breakfast'), dailyProducts.breakfast || {});
        restoreDailyItem(daily.find('.firstLunch'), dailyProducts.firstLunch || {});
        restoreDailyItem(daily.find('.secondLunch'), dailyProducts.secondLunch || {});
        restoreDailyItem(daily.find('.thirdLunch'), dailyProducts.thirdLunch || {});
        restoreDailyItem(daily.find('.dinner'), dailyProducts.dinner || {});
        restoreDailyItem(daily.find('.secondDinner'), dailyProducts.secondDinner || {});

        if(dailyProducts.additional)
            for(var i = 0; i < dailyProducts.additional.length; i++){
                var additional = dailyProducts.additional[i];
                var additionalItem = getNewItemClone();
                restoreDailyItem(additionalItem, additional || {});
            }
    }

    function responseDaily(date) {
        clearDaily();
        $.get(window.location.href + "daily", {date: date}, function (data) {
            restoreDaily(data);
            updateLinks();
            reCalcDaily();
        });
    }

    function createDailyItem(el){
        return {
            details: {
                width: el.find('.details').width(),
                height: el.find('.details').height()
            },
            products: utils.getProductFromInput(el)
        };
    }

    function restoreDailyItem(el, details){
        if(details.details) {
            el.find('.details').width(details.details.width);
            el.find('.details').height( details.details.height);
        } else {
            el.find('.details').width(100);
            el.find('.details').height(20);
        }

        utils.setProductInput(el, details.products || {});

    }

    function saveDaily(){
        var date = $('.dailyDate').val();
        //$('.dailyDate').val('2014-06-21')

        var products = {
            breakfast: createDailyItem(daily.find('.breakfast')),
            firstLunch: createDailyItem(daily.find('.firstLunch')),
            secondLunch: createDailyItem(daily.find('.secondLunch')),
            thirdLunch: createDailyItem(daily.find('.thirdLunch')),
            dinner: createDailyItem(daily.find('.dinner')),
            secondDinner: createDailyItem(daily.find('.secondDinner')),
            additional: []
        };

        daily.find('.additionalProduct:not(.newItem)').each(function(){
            products.additional.push(createDailyItem($(this)));
        });

        var data = {
            date: date,
            products: products
        };
        $.post(window.location.href +  "daily", data)
            .done(function () {
                console.log("Daily added");
            })
            .fail(function (error) {
                console.log(error.responseText);
            });
    }
})();