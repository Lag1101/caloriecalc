/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */
(function(){
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
        var product = utils.getProductFromInput(newProduct);
        $.post(window.location.href +  "newProduct", product)
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
            products = data;
            updateList();
        });
    }

    function totallyRemove(view, product) {
        if( confirm("Вы уверены, что хотите удалить " + product.description) )
            utils.removeFromCurrentDish(view, function(){
                removeFromServer(product);
            });
    }



    function removeFromServer(product){
        $.post(window.location.href +  "removeProduct", product)
            .done(function () {
                console.log("Product removed");
                getUpdates();
            })
            .fail(function (error) {
                console.log(error.responseText);
            });
    }

    function addToCurrentDish(product){
        var productView = $('<tr>')
            .append($('<div>')
                .addClass('product')
                .append($('<button>').addClass('item remove').text('-'))
                .append($('<p>').addClass('description item'))
                .append($('<p>').addClass('proteins item').text('-'))
                .append($('<p>').addClass('triglyceride item').text('-'))
                .append($('<p>').addClass('carbohydrate item').text('-'))
                .append($('<p>').addClass('calorie item').text('-'))
                .append($('<input>').addClass('mass item').attr('placeholder', 'Вес').attr('value', '100').text('-').on('input paste', function(){
                    $(this).val( utils.validate( $(this).val() ) );
                }))
        );


        utils.setProductP(productView, product);
        productView.find('.remove').click(utils.removeFromCurrentDish.bind(null, productView, reCalc));

        productView.find('input').on('input propertychange paste', reCalc);

        productView.appendTo(currentDishProducts);

        reCalc();
    }

    function reCalc(){
        var res = {
            proteins: 0,
            triglyceride: 0,
            carbohydrate: 0,
            calorie: 0
        };
        currentDishProducts.find('.product').each(function(){
            var item = $(this);
            var product = utils.getProductFromP(item);
            var mass = +(item.find('.mass').val()) / 100;

            res.proteins += +product.proteins * mass;
            res.triglyceride += +product.triglyceride * mass;
            res.carbohydrate += +product.carbohydrate * mass;
            res.calorie += +product.calorie * mass;
        });
        resultDish.find('.proteins').text(res.proteins.toFixed(3));
        resultDish.find('.triglyceride').text(res.triglyceride.toFixed(3));
        resultDish.find('.carbohydrate').text(res.carbohydrate.toFixed(3));
        resultDish.find('.calorie').text(res.calorie.toFixed(3));
    }

    function reorder(products, searchStr){
        var reorderProducts = products;

        //products.map(function(product){
        //    if(utils.distanceBeetweenStrings(product.description, searchStr) < 5){
        //        reorderProducts.push(product);
        //    }
        //});

        function compText(p1, p2){
            return (order === "greater") ^ (p1[sortKey] < p2[sortKey]);
        }
        function compValues(p1, p2){
            return (order === "greater") ^ (parseFloat(p1[sortKey]) < parseFloat(p2[sortKey]));
        }
        var comp = (sortKey === 'description' || sortKey === 'details') ? compText : compValues;

        reorderProducts = reorderProducts.sort(comp);

        return reorderProducts;
    }

    function updateList() {

        var reorderProducts = reorder(products, newProduct.find('.description').val());

        productsList.empty();
        for(var i = 0; i < reorderProducts.length; i++){
            var product = reorderProducts[i];

            var productView = $('<tr>')
                .append($('<div>')
                    .append($('<button>').addClass('item add').text('+'))
                    .append($('<p>').addClass('description item').text('Описание'))
                    .append($('<p>').addClass('proteins item').text('Белки'))
                    .append($('<p>').addClass('triglyceride item').text('Жиры'))
                    .append($('<p>').addClass('carbohydrate item').text('Углеводы'))
                    .append($('<p>').addClass('calorie item').text('Ккал'))
                    .append($('<button>').addClass('item remove').text('-'))
                    .addClass('product'));


            utils.setProductP(productView, product);

            productView.find('.add').click(addToCurrentDish.bind(null, product));
            productView.find('.remove').click(totallyRemove.bind(null, productView, product));


            productView.appendTo(productsList);
        }
    }
})();