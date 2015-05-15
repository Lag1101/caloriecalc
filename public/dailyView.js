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

    Product.emptyProduct.writeEl(daily.find('.newItem'));
    updateLinks();
    daily.find('.item').on('input paste',function(){
        reCalcDaily();
        saveDaily();
    });

    $('.addButton').click(function(){
        var newItem = getNewItemClone();
        Product.emptyProduct.writeEl(daily.find('.newItem'));
        updateLinks();
        reCalcDaily();
        saveDaily();
    });

    daily.find('input').on('input paste', function(){
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

        var resEl = $('.result');
        res.writeEl(resEl);
    }

    function clearDaily(){
        Product.emptyProduct.writeEl(daily.find('.breakfast'));
        Product.emptyProduct.writeEl(daily.find('.firstLunch'));
        Product.emptyProduct.writeEl(daily.find('.secondLunch'));
        Product.emptyProduct.writeEl(daily.find('.thirdLunch'));
        Product.emptyProduct.writeEl(daily.find('.dinner'));
        Product.emptyProduct.writeEl(daily.find('.secondDinner'));

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