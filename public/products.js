/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */
(function(){

    var products = [];

    var addButton = $('.addProductButton');
    var newProduct = $('.newProduct');
    var productsList = $('.productsList');
    var currentDishProductsView = $('.currentDishProducts');
    var resultDish = $('.resultDish');
    var sortBy = $('.sortBy');
    var sortOrder = $('.sortOrder');
    var portionView = $('.portion');

    var sortKey = sortBy.find('option:selected').val();
    var order = sortOrder.find('option:selected').val();

    portionView.find('input').on('input paste', function(){
        reCalc();
        saveCurrentDishProducts();
    });
    resultDish.find('input').on('input paste', function(){
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

    getUpdates();

    addButton.click(function(){
        var product = new Product();
        product.readEl(newProduct);
        $.post(window.location.href +  "newProduct", product.getRaw())
            .done(function () {
                console.log("Product added");
                Product.emptyProduct.writeEl(newProduct);
                getUpdates();
            })
            .fail(function (error) {
                console.log(error.responseText);
            });
    });

    newProduct.find('.description').on('input paste', updateList);

    function getUpdates(){
        $.get(window.location.href + "list", function (data) {
            products = [];
            data.map(function(d){
                products.push(new Product(d));
            });
            updateList();
        });
        $.get(window.location.href + "currentDishProducts", function (data) {
            updateCurrentDishProducts(data);
        });
    }

    function totallyRemove(view, product) {
        if( confirm("Вы уверены, что хотите удалить " + product.description + " ?") )
            utils.removeFromCurrentDish(view, function(){
                saveCurrentDishProducts();
                removeFromServer(product);
            });
    }

    function removeFromServer(product){
        $.post(window.location.href +  "removeProduct", {id: product.id})
            .done(function () {
                console.log("Product removed");
                getUpdates();
            })
            .fail(function (error) {
                console.log(error.responseText);
            });
    }

    function addToCurrentDish(datum){
        var product = new Product(datum);
        var productView = $('<tr>')
            .append($('<div>')
                .addClass('product')
                .append($('<button>').addClass('remove').text('-'))
                .append($('<div>').addClass('description item'))
                .append($('<input>').addClass('proteins'))
                .append($('<input>').addClass('triglyceride'))
                .append($('<input>').addClass('carbohydrate'))
                .append($('<input>').addClass('calorie'))
                .append($('<input>').addClass('mass').on('input paste', function(){
                    $(this).val( utils.validate( $(this).val() ) );
                    saveCurrentDishProducts();
                }))
        );
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

    function calcPortion(){
        var dish = new Product();
        dish.readEl(resultDish);

        var portion = new Product();
        portion.readEl(portionView);

        if( !dish.mass ) return;

        var rel = portion.mass / dish.mass;

        portion.applyToNumerics(function(val, name){
            return dish[name] * rel;
        });

        portion.writeEl(portionView, ['mass']);
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

        res.writeEl(resultDish, ['mass']);

        calcPortion();
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
                dish.writeEl(resultDish);
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
        dish.readEl(resultDish);
        var portion = new Product();
        portion.readEl(portionView);
        $.post(window.location.href +  "currentDishProducts", {
            portion: portion.getRaw(),
            dish: dish.getRaw(),
            currentDishProducts:currentDishProducts
        })
            .done(function () {
                console.log("currentDishProducts saved");
            })
            .fail(function (error) {
                console.log(error.responseText);
            });
    }
    function updateList() {

        var reorderProducts = reorder(products, newProduct.find('.description').val());

        productsList.empty();
        for(var i = 0; i < reorderProducts.length; i++){
            var product = reorderProducts[i];

            var productView = $('<tr>')
                .append($('<div>')
                    .append($('<button>').addClass('add').text('+'))
                    .append($('<div>').addClass('description item'))
                    .append($('<input>').addClass('proteins'))
                    .append($('<input>').addClass('triglyceride'))
                    .append($('<input>').addClass('carbohydrate'))
                    .append($('<input>').addClass('calorie'))
                    .append($('<button>').addClass('remove').text('-'))
                    .addClass('product'));

            productView.find('input').attr('disabled', true).addClass('item');
            product.writeEl(productView);

            productView.find('.add').click(addToCurrentDish.bind(null, product));
            productView.find('.remove').click(totallyRemove.bind(null, productView, product));


            productView.appendTo(productsList);
        }
    }
})();