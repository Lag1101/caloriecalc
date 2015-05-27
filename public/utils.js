/**
 * Created by vasiliy.lomanov on 13.05.2015.
 */

var utils = (function(){
    var fields = ['description', 'proteins', 'triglyceride', 'carbohydrate', 'calorie', 'details'];

    function validate(str){
        return str.replace(',', '.');
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
    function removeFromCurrentDish(view, cb){
        view.detach();
        return cb && cb();
    }

    var icons = {
        save:           $('<i>').addClass('glyphicon glyphicon-floppy-disk'),
        cancel:     $('<i>').text('Отмена'),//.addClass('glyphicon glyphicon-remove'),
        confirm:    $('<i>').text('Ok'),//.addClass('glyphicon glyphicon-ok'),
        remove:     $('<i>').text('-'),//.addClass('glyphicon glyphicon-trash'),
        add:     $('<i>').text('+')//.addClass('glyphicon glyphicon-plus')
    };

    var DropdownButton =
            $('<div>')
                .addClass('btn-group btn-group-xs')
                .append($('<a>')
                    .addClass('btn btn-block btn-default dropdown-toggle')
                    .attr('data-toggle', 'dropdown')
                    .append($('<span>')
                        .addClass('caret')))
                .append($('<ul>')
                    .addClass('dropdown-menu')
                    .attr('aria-labelledby', 'dropdownMenu2')
                    .append($('<li>')
                        .append($('<a>')
                            .addClass('btn btn-xs edit')
                            .append($('<i>')
                                .addClass('icon-pencil')
                                .text('Править'))))
                    .append($('<li>')
                        .append($('<a>')
                            .addClass('btn btn-xs btn-danger remove')
                            .append($('<i>')
                                .addClass('icon-trash')
                                .text('Удалить')))));

    function confirmDialog(message, cb){
        BootstrapDialog.confirm({
            title: 'Предупреждение',
            message: message,
            type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            btnCancelLabel: 'Не удалять!', // <-- Default value is 'Cancel',
            btnOKLabel: 'Там ему и место', // <-- Default value is 'OK',
            btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
            callback: function(result) {
                // result will be true if button was click, while it will be false if users close the dialog directly.
                if(result) {
                    return cb && cb();
                }
            }
        });
    }

    return {
        confirmDialog: confirmDialog,
        icons: icons,
        DropdownButton: DropdownButton,
        removeFromCurrentDish: removeFromCurrentDish,
        validate: validate,
        fromDateToString: fromDateToString,
        distanceBeetweenStrings: distanceBeetweenStrings
    };
})();