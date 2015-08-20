/**
 * Created by vasiliy.lomanov on 20.08.2015.
 */


function list($root, items, $template){
    this.items = items.map(function(item){
        var product = new Product(item);
        var $view = $template.clone()
        $root.append()
    });
}