/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */
(function(socket){

    var products = [];

    var resultDish = $('.resultDish');
    var defaultDish = resultDish.find('.defaultDish');
    var dishList = resultDish.find('.dishList');

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
        reCalc();
    });

    sortBy.on('change', function () {
        sortKey = sortBy.find('option:selected').val();
        updateList();
    });

    sortOrder.on('change', function () {
        order = sortOrder.find('option:selected').val();
        updateList();
    });

    socket.emit('getDishList');
    socket.on('getDishList', restoreDishList);

    getUpdates();

    addButton.click(function(){
        var product = new Product();
        product.readEl(newProduct);
        socket.emit('newProduct', product.getRaw());
        Product.emptyProduct.writeEl(newProduct);
        getUpdates();
    });

    socket.on('list', function (data) {
        products = [];
        data.map(function(d){
            products.push(new Product(d));
        });
        updateList();
    });

    socket.on('getCurrentDishes', function (data) {
        dishList.empty();
        data.map(function(dish){
            addToDishList(dish);
        })
    });

    socket.on('getCurrentDishProducts', function (data) {
        updateCurrentDishProducts(data);
    });
    function getUpdates(){
        socket.emit('list');
        socket.emit('getCurrentDishProducts');
    }

    function totallyRemove(view, product) {
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + product.description + " ?",
            function(){
                utils.removeFromCurrentDish(view, function(){
                    removeFromServer(product);
                });
            }
        );
    }

    function fixDish(dish){
        socket.emit('fixDish', dish);
    }

    function addToDishList(dish){
        var fullViewClone = $('<div>')
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie'))
            .append($('<input>').addClass('mass'))
            .addClass('dish inline-block');

        new Product(dish.full).writeEl(fullViewClone);

        var portionViewClone = $('<div>')
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie'))
            .append($('<input>').addClass('mass'))
            .addClass('portion inline-block');

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
                        //utils.removeFromCurrentDish(dishView, saveDishList);
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
            calcPortion(dishView);
            dish.portion.mass = $(this).val();
            fixDish(dish);
        });
        fullViewClone.find('.mass').on('input change', function(){
            calcPortion(dishView);
            dish.full.mass = $(this).val();
            fixDish(dish);
        });

        dishList.append(dishView);
    }

    function restoreDishList(dishListRow){
        dishListRow.map(function(d){
            var dish = new Product(d.dish);
            var portion = new Product(d.portion);
            var description = d.description;

            addToDishList(dish, portion, description);
        });
    }

    function removeFromServer(product){
        socket.emit('removeProduct', product.id);
        getUpdates();
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
                    $(this).val( utils.validate( $(this).val() ) );
                    fixDishProduct(productView, product);
                })));

        productView.find('input').addClass('item');
        productView.find('input:not(.mass)').attr('disabled', true);

        product.writeEl(productView);
        productView.find('.remove').click(utils.removeFromCurrentDish.bind(null, productView, function(){
            reCalc();
            socket.emit('removeDishProduct', product.id);
        }));

        productView.find('input').on('input propertychange paste', function(){
            reCalc();
            fixDishProduct(productView, product);
        });

        productView.appendTo(currentDishProductsView);

        reCalc();
    }

    function fixDishProduct(productView, product){
        var fixedProduct = new Product(product);
        fixedProduct.readEl(productView);
        socket.emit('fixDishProduct', fixedProduct);
    }

    function calcPortion(el){
        var dish = new Product();
        dish.readEl(el.find('.dish'));

        var portion = new Product();
        portion.readEl(el.find('.portion'));

        if( !dish.mass ) return;

        var rel = portion.mass / dish.mass;

        portion.applyToNumerics(function(val, name){
            return dish[name] * rel;
        });

        portion.writeEl(el.find('.portion'), ['mass']);
    }

    function reCalc(){
        var res = new Product();

        currentDishProductsView.find('.product').each(function(){
            var item = $(this);
            var product = new Product();
            product.readEl(item);
            var mass = +(item.find('.mass').val()) / 100;

            res.proteins += +product.proteins * mass;
            res.triglyceride += +product.triglyceride * mass;
            res.carbohydrate += +product.carbohydrate * mass;
            res.calorie += +product.calorie * mass;
        });

        res.writeEl(fullView, ['mass']);

        calcPortion(defaultDish);
    }

    function reorder(products, searchStr){
        var reorderProducts = products;

        function comp(p1, p2){
            var v1 = p1[sortKey];
            var v2 = p2[sortKey];

            if( (v1 < v2) ^ (order !== "greater") )
                return -1;
            else if( (v2 < v1) ^ (order !== "greater")  )
                return 1;
            else
                return 0;
        }
        reorderProducts = reorderProducts.sort(comp);

        return reorderProducts;
    }
    function updateCurrentDishProducts(data) {
        currentDishProductsView.empty();
        if(data) {
            var currentDishProductsRow = data;
            if(currentDishProductsRow)
                currentDishProductsRow.map(addToCurrentDish);
        }
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

    function updateList() {

        var reorderProducts = reorder(products, newProduct.find('.description').val());

        productsList.empty();
        for(var i = 0; i < reorderProducts.length; i++){
            var product = reorderProducts[i];

            var b = utils.DropdownButton.clone();
            b.find('.remove').click(function(){
                console.log('удалить');
            });

            var productView = $('<div>')
                .append($('<div>')
                    //.append($('<button>').addClass('add item').text('+'))
                    //
                    .append($('<button>').addClass('add btn item btn-xs btn-default').append(utils.icons.add.clone()))
                    .append(utils.DropdownButton.clone())
                    .append($('<div>').addClass('description item disableForInput'))
                    .append($('<input>').addClass('proteins'))
                    .append($('<input>').addClass('triglyceride'))
                    .append($('<input>').addClass('carbohydrate'))
                    .append($('<input>').addClass('calorie'))
                    //.append($('<button>').addClass('remove item').text('-'))
            );


            productView
                .append($('<div>')
                    //.append($('<button>').addClass('edit item'))
                    .append($('<div>').addClass('blankDescription blankItem'))
                    .append($('<div>').addClass('blankItem'))
                    .append($('<div>').addClass('blankItem'))
                    .append($('<div>').addClass('blankItem'))
                    .append($('<button>').addClass('save item hidden btn btn-xs btn-default').append(utils.icons.confirm.clone()))
                    .append($('<button>').addClass('cancel item hidden btn btn-xs btn-default').append(utils.icons.cancel.clone()))
                    .addClass('edit-menu'));

            var root = $('<div>').append(productView);

            productView.addClass('product inline-block');
            //root.addClass('product');
            //root.addClass('product');


            root.find('input').addClass('item');
            hide(root);
            product.writeEl(root);

            root.find('.edit').click(editProduct.bind(null, root, product));
            root.find('.add').click(copyToDishProducts.bind(null, product));
            root.find('.remove').click(totallyRemove.bind(null, root, product));

            productsList.append(root).trigger('append');
        }
    }
})(socket);