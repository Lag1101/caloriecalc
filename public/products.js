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

    var addButton = $('.addProductButton');
    var newProduct = $('.newProduct');
    var productsList = $('.productsList');
    var currentDishProductsView = $('.currentDishProducts');
    var sortBy = $('.sortBy');
    var sortOrder = $('.sortOrder');
    var portionView = defaultDish.find('.portion');
    var fullView = defaultDish.find('.dish');

    var sortKey = sortBy.find('option:selected').val();
    var order = sortOrder.find('option:selected').val();


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

    sortBy.on('change', function () {
        sortKey = sortBy.find('option:selected').val();
        updateList();
    });

    sortOrder.on('change', function () {
        order = sortOrder.find('option:selected').val();
        updateList();
    });

    socket.on('getDishList', restoreDishList);

    //newProduct.find('.description').on('input change', function(){
    //    updateList();
    //});
    newProduct.find('input').on('input change', function(){
        if(utils.validateField($(this))){
            addButton
                .attr('disabled', false)
                .removeClass('disabled');
        } else {
            addButton
                .attr('disabled', true)
                .addClass('disabled');
        }
    });
    addButton.click(function(){
        var product = new Product();
        product.readEl(newProduct);
        socket.emit('newProduct', product.getRaw());
        Product.emptyProduct.writeEl(newProduct);
    });

    socket.on('list', function (data) {
        products = [];
        async.map(data, function(d, cb){
            return cb(null, new Product(d))
        }, function(err, resProducts){
            if(err)
                console.error(err);
            else{
                products = resProducts;

                return updateList();
            }
        });
    });

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

    socket.on('newDishProduct', function(newDishProductRaw){
        currentDishProducts.push(newDishProductRaw);
        addToCurrentDish(newDishProductRaw);
        reCalc();
    });

    responseProductList();
    responseDishProductList();
    responseDishList();

    function responseDishList(){
        socket.emit('getCurrentDishes');
    }
    function responseDishProductList(){
        socket.emit('getCurrentDishProducts');
    }
    function responseProductList(){
        socket.emit('list');
    }

    function removeProduct(view, product) {
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + product.description + " ?",
            function(){
                socket.emit('removeProduct', product.id);
                view.detach();
            }
        );
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

            dishView.find('.description').html(dish.description).on('input change', function(){
                dish.description = $(this).html();
                fixDish(dish);
            });
            portionViewClone.find('.mass').on('input change', function(){
                utils.validateField($(this));
                calcPortion(dishView, function(){
                    var p = new Product();
                    p.readEl(portionViewClone);
                    dish.portion = p;
                    fixDish(dish);
                });
            });
            fullViewClone.find('.mass').on('input change', function(){
                utils.validateField($(this));
                calcPortion(dishView, function(){
                    var p = new Product();
                    p.readEl(fullViewClone);
                    dish.full = p;
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

    function copyToDishProducts(product){
        socket.emit('newDishProduct', product.id);
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

    function reorder(products, cb){
        var mult = (order === "greater") ? 1 : -1;
        var sorted = products.sort(function(p1, p2){
            if (p1[sortKey] < p2[sortKey]) {
                return mult * -1;
            }
            if (p1[sortKey] > p2[sortKey]) {
                return mult * 1;
            }
            // a must be equal to b
            return 0;
        });

        return cb(null, sorted);
    }

    function appear(productView){
        var inputs = productView.find('input');
        inputs.attr('disabled', false);
        productView.find('.description')
            .removeClass('disableForInput')
            .addClass('enableForInput')
            .attr('contenteditable', true);

        var editMenu = productView.find('.edit-menu');

        editMenu.find('.save').removeClass('hidden');
        editMenu.find('.cancel').removeClass('hidden');
        editMenu.removeClass('hidden');
    }
    function hide(productView){
        var inputs = productView.find('input');
        inputs.attr('disabled', true);

        productView.find('.description')
            .addClass('disableForInput')
            .removeClass('enableForInput')
            .attr('contenteditable', false);

        var editMenu = productView.find('.edit-menu');
        editMenu.find('.save').addClass('hidden');
        editMenu.find('.cancel').addClass('hidden');
        editMenu.addClass('hidden');
    }
    function editProduct(productView, product){
        appear(productView);
        var editMenu = productView.find('.edit-menu');
        editMenu.find('.save').click(function(){
            var fixedProduct = new Product(product);
            fixedProduct.readEl(productView);
            socket.emit('fixProduct', fixedProduct);
            hide(productView);
        });

        editMenu.find('.cancel').click(function(){
            hide(productView);
        });
        //hide(productView);
    }


    var productViewTemp = $('<div>')
        .append($('<div>')
            .append($('<button>').addClass('add btn item btn-xs btn-default').append(utils.icons.add.clone()))
            .append(utils.DropdownButton.clone())
            .append($('<div>').addClass('description item disableForInput'))
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie')))
        .append($('<div>')
            //.append($('<button>').addClass('edit item'))
            .append($('<div>').addClass('blankDescription blankItem'))
            .append($('<div>').addClass('blankItem'))
            .append($('<div>').addClass('blankItem'))
            .append($('<div>').addClass('blankItem'))
            .append($('<button>').addClass('save item hidden btn btn-xs btn-default').append(utils.icons.confirm.clone()))
            .append($('<button>').addClass('cancel item hidden btn btn-xs btn-default').append(utils.icons.cancel.clone()))
            .addClass('edit-menu'));

    function updateList(callback) {
        async.waterfall([
            function(cb){
                reorder(products, cb)
            },
            function(reorderProducts, cb){
                productsList.empty();
                reorderProducts.map(function(product){
                    var productView = productViewTemp.clone();

                    var root = $('<div>').append(productView);

                    productView.addClass('product inline-block');

                    root.find('input').addClass('item');
                    hide(root);
                    product.writeEl(root);

                    root.find('.edit').click(editProduct.bind(null, root, product));
                    root.find('.add').click(copyToDishProducts.bind(null, product));
                    root.find('.remove').click(removeProduct.bind(null, root, product));

                    productsList.append(root).trigger('append');

                });
                return cb();
            }
        ], function(err){
            if(err)
                console.error(err);
            else
                console.log("List updated");

            return callback && callback(err);
        });
    }
})(socket);