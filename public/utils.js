/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

var utils = (function(){
    var fields = ['description', 'proteins', 'triglyceride', 'carbohydrate', 'calorie', 'details'];

    function validate(str){
        return str.replace(',', '.');
    }

    function getProductFromP(item) {
        var res = {};

        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            var str;
            if(field !== 'description' && field !== 'details')
                str = item.find('.' + field).text();
            else
                str = item.find('.' + field).val();
            res[field] = str;
        }

        return res;
    }
    function getProductFromInput(item){
        var res = {};

        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            var str;
            if(field !== 'description' && field !== 'details')
                str = item.find('.' + field).val();
            else
                str = item.find('.' + field).val();
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

            if(field !== 'description' && field !== 'details')
                view.find('.'+field).text( utils.validate( view.find('.'+field).text() ) );
        }

        view.find('.details').text(product.details);
    }
    function setProductInput(view, product) {
        for(var i = 0; i < fields.length; i++){
            var field = fields[i];
            if(product[field])
                view.find('.'+field).val(product[field]);
            else
                view.find('.'+field).val('');
            if(field !== 'description' && field !== 'details')
                view.find('.'+field).val( utils.validate( view.find('.'+field).val() ) );
        }
        view.find('.details').text(product.details);
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

    function LevenshteinDistance(a, b) {
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for(i = 0; i <= b.length; i++){
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for(j = 0; j <= a.length; j++){
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for(i = 1; i <= b.length; i++){
            for(j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                        Math.min(matrix[i][j-1] + 1, // insertion
                            matrix[i-1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }

    function distanceBeetweenStrings(s1,s2) {
        var w1 = s1.split(' ');
        var w2 = s2.split(' ');

        var distance = 0;
        for(var k1 = 0; k1 < w1.length; k1++) {
            if(w1[k1])
            for(var k2 = 0; k2 < w2.length; k2++) {
                if(w2[k2])
                    distance += LevenshteinDistance(w1[k1], w2[k2]);
            }
        }

        return distance;
    }

    return {
        validate: validate,
        getProductFromP: getProductFromP,
        getProductFromInput: getProductFromInput,
        setProductP: setProductP,
        setProductInput: setProductInput,
        removeFromCurrentDish: removeFromCurrentDish,
        fromDateToString: fromDateToString,
        distanceBeetweenStrings: distanceBeetweenStrings
    };
})();