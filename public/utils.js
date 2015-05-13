/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

var utils = (function(){
    var fields = ['description', 'proteins', 'triglyceride', 'carbohydrate', 'calorie'];

    function validate(str){
        return str.replace(',', '.');
    }

    function getProductFromP(item) {
        var res = {};

        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            var str = item.find('.' + field).text();
            res[field] = str;
        }

        return res;
    }
    function getProductFromInput(item){
        var res = {};

        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            var str = item.find('.' + field).val();
            res[field] = str;
        }

        return res;
    }

    function setProductP(view, product) {
        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            if(product[field])
                view.find('.'+field).text(product[field]);
            else
                view.find('.'+field).text('');

            if(field !== 'description')
                view.find('.'+field).text( utils.validate( view.find('.'+field).text() ) );
        }
    }
    function setProductInput(view, product) {
        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            if(product[field])
                view.find('.'+field).val(product[field]);
            else
                view.find('.'+field).val('');
            if(field !== 'description')
                view.find('.'+field).val( utils.validate( view.find('.'+field).val() ) );
        }
    }

    function removeFromCurrentDish(view, cb){
        view.detach();
        return cb && cb();
    }

    function fromDateToString(d){
        var date = d || new Date();

        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = date.getDate().toString();

        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
    }

    return {
        validate: validate,
        getProductFromP: getProductFromP,
        getProductFromInput: getProductFromInput,
        setProductP: setProductP,
        setProductInput: setProductInput,
        removeFromCurrentDish: removeFromCurrentDish,
        fromDateToString: fromDateToString
    };
})();