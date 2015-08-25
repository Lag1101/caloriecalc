/**
 * Created by vasiliy.lomanov on 20.08.2015.
 */

var Product = require('./product');

function List($root, items, $template){
    this.items = items.map(function(item){
        var product = new Product(item);
        var $view = $template.clone();
        product.linkView($view);
        product.enabled(true);
        $root.append($view);

        return product;
    });
}


module.exports = List;