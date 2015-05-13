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

    $('.addButton').click(function(){
        var newItem = getNewItemClone();
        daily.find('.newItem').find('input').val('');
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
        utils.setProductInput(daily.find('.breakfast'), dailyProducts.breakfast || {});
        utils.setProductInput(daily.find('.firstLunch'), dailyProducts.firstLunch || {});
        utils.setProductInput(daily.find('.secondLunch'), dailyProducts.secondLunch || {});
        utils.setProductInput(daily.find('.thirdLunch'), dailyProducts.thirdLunch || {});
        utils.setProductInput(daily.find('.dinner'), dailyProducts.dinner || {});
        utils.setProductInput(daily.find('.secondDinner'), dailyProducts.secondDinner || {});

        if(dailyProducts.additional)
            for(var i = 0; i < dailyProducts.additional.length; i++){
                var additional = dailyProducts.additional[i];
                var additionalItem = getNewItemClone();
                utils.setProductInput(additionalItem, additional || {});
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

    function saveDaily(){
        var date = $('.dailyDate').val();
        //$('.dailyDate').val('2014-06-21')

        var products = {
            breakfast: utils.getProductFromInput(daily.find('.breakfast')),
            firstLunch: utils.getProductFromInput(daily.find('.firstLunch')),
            secondLunch: utils.getProductFromInput(daily.find('.secondLunch')),
            thirdLunch: utils.getProductFromInput(daily.find('.thirdLunch')),
            dinner: utils.getProductFromInput(daily.find('.dinner')),
            secondDinner: utils.getProductFromInput(daily.find('.secondDinner')),
            additional: []
        };

        daily.find('.additionalProduct:not(.newItem)').each(function(){
            products.additional.push(utils.getProductFromInput($(this)));
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