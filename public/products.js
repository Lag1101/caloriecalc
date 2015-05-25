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
    var dishView = defaultDish.find('.dish');

    var sortKey = sortBy.find('option:selected').val();
    var order = sortOrder.find('option:selected').val();

    resultDish.find('.addButton').click(function(){
        var dish = new Product();
        var portion = new Product();

        dish.readEl(dishView);
        portion.readEl(portionView);

        addToDishList(dish, portion, '');
    });
    defaultDish.find('.mass').on('input paste', function(){
        reCalc();
        saveCurrentDishProducts();
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
    socket.on('getCurrentDishProducts', function (data) {
        updateCurrentDishProducts(data);
    });
    function getUpdates(){
        socket.emit('list');
        socket.emit('getCurrentDishProducts');
    }

    function totallyRemove(view, product) {
        if( confirm("Вы уверены, что хотите удалить " + product.description + " ?") )
            utils.removeFromCurrentDish(view, function(){
                saveCurrentDishProducts();
                removeFromServer(product);
            });
    }

    function addToDishList(dish, portion, description){
        var dishViewClone = $('<div>')
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie'))
            .append($('<input>').addClass('mass'))
            .addClass('dish inline-block');
        dish.writeEl(dishViewClone);

        var portionViewClone = $('<div>')
            .append($('<input>').addClass('proteins'))
            .append($('<input>').addClass('triglyceride'))
            .append($('<input>').addClass('carbohydrate'))
            .append($('<input>').addClass('calorie'))
            .append($('<input>').addClass('mass'))
            .addClass('portion inline-block');
        portion.writeEl(portionViewClone);

        var dishPortion = $('<div>')
            .append($('<button>').addClass('remove').text('-'))
            .append($('<div>').addClass('description item enableForInput').attr('contenteditable', true))
            .append(dishViewClone)
            .append(portionViewClone)
            .addClass('product');

        dishPortion.find('.remove').click(function(){
            utils.removeFromCurrentDish(dishPortion, saveDishList);
        });
        dishPortion.find('input').addClass('item');
        dishPortion.find('input:not(.mass)').attr('disabled', true);

        dishPortion.find('.description').html(description).on('input change', function(){
            saveDishList();
        });
        dishPortion.find('.mass').on('input change', function(){
            calcPortion(dishPortion);
            saveDishList();
        });
        dishList.append(dishPortion);
    }

    function saveDishList() {

        var dishListRow = [];

        dishList.find('.product').each(function(){
            var dish = new Product();
            var portion = new Product();
            dish.readEl($(this).find('.dish'));
            portion.readEl($(this).find('.portion'));

            var description = $(this).find('.description').html();

            dishListRow.push({
                description: description,
                dish: dish.getRaw(),
                portion: portion.getRaw()
            });
        });

        socket.emit('setDishList', dishListRow);
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

    function addToCurrentDish(datum){
        var product = new Product(datum);
        var productView = $('<div>')
                .addClass('product')
                .append($('<button>').addClass('remove').text('-'))
                .append($('<div>').addClass('description item disableForInput'))
                .append($('<input>').addClass('proteins'))
                .append($('<input>').addClass('triglyceride'))
                .append($('<input>').addClass('carbohydrate'))
                .append($('<input>').addClass('calorie'))
                .append($('<input>').addClass('mass').on('input paste', function(){
                    $(this).val( utils.validate( $(this).val() ) );
                    saveCurrentDishProducts();
                }));

        productView.find('input').addClass('item');
        productView.find('input:not(.mass)').attr('disabled', true);

        product.writeEl(productView);
        productView.find('.remove').click(utils.removeFromCurrentDish.bind(null, productView, function(){
            reCalc();
            saveCurrentDishProducts();
        }));

        productView.find('input').on('input propertychange paste', function(){
            reCalc();
            saveCurrentDishProducts();
        });

        productView.appendTo(currentDishProductsView);

        reCalc();
        saveCurrentDishProducts();
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

        res.writeEl(dishView, ['mass']);

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
            var currentDishProductsRow = data.currentDishProducts;
            if(data.dish) {
                var dish = new Product(data.dish);
                dish.writeEl(dishView);
            }
            if(data.portion) {
                var portion = new Product(data.portion);
                portion.writeEl(portionView);
            }
            if(currentDishProductsRow)
                currentDishProductsRow.map(addToCurrentDish);


        }
    }
    function saveCurrentDishProducts() {
        var currentDishProducts = [];
        currentDishProductsView.find('.product').each(function(){
            var product = new Product();
            product.readEl($(this));
            currentDishProducts.push(product.getRaw());
        });
        var dish = new Product();
        dish.readEl(dishView);
        var portion = new Product();
        portion.readEl(portionView);
        socket.emit('setCurrentDishProducts',{
            portion: portion.getRaw(),
            dish: dish.getRaw(),
            currentDishProducts:currentDishProducts
        });
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

            var productView = $('<div>')
                .append($('<div>')
                    .append($('<button>').addClass('add item').text('+'))
                    .append($('<div>').addClass('description item'))
                    .append($('<input>').addClass('proteins'))
                    .append($('<input>').addClass('triglyceride'))
                    .append($('<input>').addClass('carbohydrate'))
                    .append($('<input>').addClass('calorie'))
                    .append($('<button>').addClass('remove item').text('-')))
                .addClass('product');

            productView
                .append($('<div>')
                    .append($('<button>').addClass('edit item').text('Редактировать'))
                    .append($('<div>').addClass('blankDescription blankItem'))
                    .append($('<div>').addClass('blankItem'))
                    .append($('<div>').addClass('blankItem'))
                    .append($('<div>').addClass('blankItem'))
                    .append($('<button>').addClass('save item hidden').text('Сохранить'))
                    .append($('<button>').addClass('cancel item hidden').text('Отменить'))
                    .addClass('edit-menu'));

            productView.find('input').addClass('item');
            hide(productView);
            product.writeEl(productView);

            productView.find('.edit').click(editProduct.bind(null, productView, product));
            productView.find('.add').click(addToCurrentDish.bind(null, product));
            productView.find('.remove').click(totallyRemove.bind(null, productView, product));

            productsList.append(productView).trigger('append');
        }
    }
})(socket);