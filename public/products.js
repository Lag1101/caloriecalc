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

    var sortKey = sortBy.find('option:selected').val();
    var order = sortOrder.find('option:selected').val();


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
                newProduct.find('.item:not(button)').empty();
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
            removeFromCurrentDish(view, function(){
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


    function removeFromCurrentDish(view, id, cb){
        view.detach();
        saveCurrentDishProducts();
        return cb && cb();
    }
    function addToCurrentDish(datum){
        var product = new Product(datum);
        var productView = $('<tr>')
            .append($('<div>')
                .addClass('product')
                .append($('<button>').addClass('remove').text('-'))
                .append($('<input>').addClass('description'))
                .append($('<input>').addClass('proteins'))
                .append($('<input>').addClass('triglyceride'))
                .append($('<input>').addClass('carbohydrate'))
                .append($('<input>').addClass('calorie'))
                .append($('<input>').addClass('mass').attr('placeholder', 'Вес').on('input paste', function(){
                    $(this).val( utils.validate( $(this).val() ) );
                    saveCurrentDishProducts();
                }))
        );
        productView.find('input').addClass('item');
        productView.find('input:not(.mass)').attr('disabled', true);

        product.writeEl(productView);
        productView.find('.remove').click(removeFromCurrentDish.bind(null, productView, product.id, reCalc));

        productView.find('input').on('input propertychange paste', reCalc);

        productView.appendTo(currentDishProductsView);

        reCalc();
        saveCurrentDishProducts();
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
        res.writeEl(resultDish);
    }

    function reorder(products, searchStr){
        var reorderProducts = products;

        //products.map(function(product){
        //    if(utils.distanceBeetweenStrings(product.description, searchStr) < 5){
        //        reorderProducts.push(product);
        //    }
        //});


        if(sortKey==='description' || sortKey==='details')
            function comp(p1, p2){
                return (order === "greater") ^ (parseFloat(p1[sortKey]) < parseFloat(p2[sortKey]));
            }
        else
            function comp(p1, p2){
                return (order === "greater") ^ (p1[sortKey] < p2[sortKey]);
            }
        reorderProducts = reorderProducts.sort(comp);

        return reorderProducts;
    }
    function updateCurrentDishProducts(data) {
        currentDishProducts = [];
        data.map(addToCurrentDish);
    }
    function saveCurrentDishProducts() {
        var currentDishProducts = [];
        currentDishProductsView.find('.product').each(function(){
            var product = new Product();
            product.readEl($(this));
            currentDishProducts.push(product.getRaw());
        });
        $.post(window.location.href +  "currentDishProducts", {currentDishProducts:currentDishProducts})
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
                    .append($('<input>').addClass('description'))
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