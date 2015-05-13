/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

var utils = (function(){
    function getProductFromP(item) {
        return {
            description: item.find('.description').text(),
            proteins: item.find('.proteins').text(),
            triglyceride: item.find('.triglyceride').text(),
            carbohydrate: item.find('.carbohydrate').text(),
            calorie: item.find('.calorie').text()
        }
    }
    function getProductFromInput(item){
        return {
            description: item.find('.description').val(),
            proteins: item.find('.proteins').val() ,
            triglyceride: item.find('.triglyceride').val(),
            carbohydrate: item.find('.carbohydrate').val(),
            calorie: item.find('.calorie').val()
        }
    }

    function setProductP(view, product) {

        view.find('.description').text(product.description || '');
        view.find('.proteins').text(product.proteins || '');
        view.find('.triglyceride').text(product.triglyceride || '');
        view.find('.carbohydrate').text(product.carbohydrate || '');
        view.find('.calorie').text(product.calorie || '');
    }
    function setProductInput(view, product) {
        view.find('.description').val(product.description || '');
        view.find('.proteins').val(product.proteins || '');
        view.find('.triglyceride').val(product.triglyceride || '');
        view.find('.carbohydrate').val(product.carbohydrate || '');
        view.find('.calorie').val(product.calorie || '');
    }

    function removeFromCurrentDish(view, cb){
        view.detach();
        return cb && cb();
    }

    return {
        getProductFromP: getProductFromP,
        getProductFromInput: getProductFromInput,
        setProductP: setProductP,
        setProductInput: setProductInput,
        removeFromCurrentDish: removeFromCurrentDish
    };
})();