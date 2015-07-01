/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */
(function(socket){

    var products = [];
    var currentDishProducts = [];
    var dishList = [];

    var resultDish = $('.resultDish');
    var defaultDish = resultDish.find('.defaultDish');
    var dishListView = resultDish.find('.dishList');

    var currentDishProductsView = $('.currentDishProducts');
    var portionView = defaultDish.find('.portion');
    var fullView = defaultDish.find('.dish');

    resultDish.find('.save').click(function(){
        var full = new Product();
        var portion = new Product();

        full.readEl(fullView);
        portion.readEl(portionView);

        socket.emit('addDish', {
            full: full,
            portion: portion
        });
    });
    defaultDish.find('.mass').on('input paste', function(){
        utils.validateField($(this));
        calcPortion(defaultDish);
    });

    socket.on('getDishList', restoreDishList);

    socket.on('getCurrentDishes', function (data) {
        dishListView.empty();
        async.each(data, function(dish, cb){
            addToDishList(dish, cb);
        }, function(err){
            if(err)
                console.error(err);
        });
    });

    socket.on('getCurrentDishProducts', function (data) {
        currentDishProductsView.empty();
        if(data) {
            async.waterfall([
                function(cb){
                    async.map(data, function(rawDishProduct, cb){
                        var dishProduct = addToCurrentDish(rawDishProduct);
                        return cb(null, dishProduct)
                    },cb);
                },
                function(res, cb){
                    currentDishProducts = res;
                    return reCalc(cb);
                }
            ], function(err) {
                if (err)
                    console.error(err);
            });
        }
    });
    socket.on('newDishProduct', function(newDishProduct){
        var p = addToCurrentDish(newDishProduct);
        currentDishProducts.push(p);
        reCalc();
    });

    responseDishProductList();
    responseDishList();

    function responseDishList(){
        socket.emit('getCurrentDishes');
    }
    function responseDishProductList(){
        socket.emit('getCurrentDishProducts');
    }

    function fixDish(dish){
        socket.emit('fixDish', dish);
    }

    var addToDishList = (function(){
        var fullViewTemp = $('<div>')
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie'))
            .append($('<input>').addClass('mass'))
            .addClass('dish inline-block');
        var portionViewTemp = $('<div>')
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie'))
            .append($('<input>').addClass('mass'))
            .addClass('portion inline-block');

        return function(newDish, cb){

            var dish = new Dish(newDish);
            var fullViewClone = fullViewTemp.clone();
            var portionViewClone = portionViewTemp.clone();
            new Product(dish.full).writeEl(fullViewClone);
            new Product(dish.portion).writeEl(portionViewClone);

            var dishView = $('<div>')
                .addClass('product')
                .append($('<div>')
                    .append($('<button>').addClass('remove btn item btn-xs btn-default').append(utils.icons.remove.clone()))
                    .append($('<div>').addClass('description item enableForInput').attr('contenteditable', true))
                    .append(fullViewClone)
                    .append(portionViewClone)
                    .addClass('inline-block'));

            dishView.find('.remove')
                .addClass('item')
                .click(function(){
                    utils.confirmDialog(
                        "Вы уверены, что хотите удалить " + dishView.find('.description').html() + " ?",
                        function(){
                            socket.emit('removeDish', dish.id);
                            dishView.detach();
                        }
                    );
                });
            dishView.find('input').addClass('item');
            dishView.find('input:not(.mass)').attr('disabled', true);

            dishView.find('.description').html(dish.description).on('input paste', function(){
                dish.description = $(this).html();
                fixDish(dish);
            });
            portionViewClone.find('.mass').on('input paste', function(){
                utils.validateField($(this));
                calcPortion(dishView, function(){
                    var p = new Product();
                    p.readEl(portionViewClone);
                    dish.portion = p;
                    fixDish(dish);
                });
            });
            fullViewClone.find('.mass').on('input paste', function(){
                utils.validateField($(this));
                calcPortion(dishView, function(){
                    var f = new Product();
                    f.readEl(fullViewClone);
                    dish.full = f;

                    var p = new Product();
                    p.readEl(portionViewClone);
                    dish.portion = p;

                    fixDish(dish);
                });
            });

            dishListView.append(dishView);

            return cb(null, dish);
        }
    })();


    function restoreDishList(dishListRaw, cb){
        async.map(dishListRaw, function(rawDish, cb){
            var dish = {
                full: new Product(rawDish.full),
                portion: new Product(rawDish.portion),
                description: rawDish.description
            };

            return addToDishList(dish, cb);
        }, function(err, res){
            if(err)
                return cb(err);
            else{
                dishList = res;
                return cb(null, dishList);
            }
        });
    }

    function addToCurrentDish(datum){
        var product = new Product(datum);
        var productView = $('<div>')
            .addClass('product')
            .append($('<div>')
                .addClass('inline-block')
                .append($('<button>').addClass('remove btn item btn-xs btn-default').append(utils.icons.remove.clone()))
                .append($('<div>').addClass('description item disableForInput'))
                .append($('<input>').addClass('proteins'))
                .append($('<input>').addClass('triglyceride'))
                .append($('<input>').addClass('carbohydrate'))
                .append($('<input>').addClass('calorie'))
                .append($('<input>').addClass('mass').on('input paste', function(){
                    if(utils.validateField($(this)))
                        fixDishProduct(productView, product);
                    reCalc();
                })));

        productView.find('input').addClass('item');
        productView.find('input:not(.mass)').attr('disabled', true);

        product.writeEl(productView);
        productView.find('.remove').click(function(){
            var i = currentDishProducts.indexOf(product);
            if(i >= 0)
                currentDishProducts.splice(i, 1);
            productView.detach();
            reCalc();
            socket.emit('removeDishProduct', product.id);
        });

        productView.appendTo(currentDishProductsView);

        return product;
    }

    function fixDishProduct(productView, product){
        product.readEl(productView);
        socket.emit('fixDishProduct', product);
    }

    function calcPortion(el, cb){

        async.waterfall([
            function(cb){
                async.parallel({
                    full: function (cb) {
                        var full = new Product();
                        full.readEl(el.find('.dish'));
                        return cb(null, full);
                    },
                    portion: function(cb)
                    {
                        var portion = new Product();
                        portion.readEl(el.find('.portion'));
                        return cb(null, portion);
                    }
                }, cb);
            },
            function(dish, cb) {
                if (!dish.full.mass)
                    return cb(new Error('Full mass is zero'));

                var rel = dish.portion.mass / dish.full.mass;
                async.each(Product.numericFields, function (field, cb) {
                    dish.portion[field] =  dish.full[field] * rel;
                    return cb();
                }, function(err){
                    return cb(err, dish);
                })
            },
            function(dish, cb){
                dish.portion.writeEl(el.find('.portion'), ['mass']);

                console.log('Calculated portion');

                return cb();
            }
        ], cb);
    }

    function reCalc(cb){
        async.series([
            function(cb){
                var res = new Product();
                async.each(currentDishProducts, function(dp, cb){
                    var mass = dp.mass / 100;

                    res.proteins += +dp.proteins * mass;
                    res.triglyceride += +dp.triglyceride * mass;
                    res.carbohydrate += +dp.carbohydrate * mass;
                    res.calorie += +dp.calorie * mass;

                    return cb();
                }, function(err){
                    if(err)
                        return cb(err);
                    res.writeEl(fullView, ['mass']);
                    console.log('calculated  dish products');
                    return cb();
                });
            },
            function(cb){
                return calcPortion(defaultDish, cb);
            }
        ],function(err){
            if(err)
                return cb && cb(err);
            else {
                console.log('portion  dish products');
                return cb && cb();
            }
        });
    }
})(socket);