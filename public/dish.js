/**
 * Created by vasiliy.lomanov on 04.06.2015.
 */

var Dish = (function(){
    function Dish(dish){
        this.constr(dish);
    }

    Dish.prototype.constr = function(dish) {
        dish = dish || {};
        this.id =  (dish.id || dish._id ||  this.id) || '';
        this.description =  (dish.description ||  this.description) || '';
        this.full =      (new Product(dish.contain[0]) ||      this.full)  || '';
        this.portion =   (new Product(dish.contain[1]) ||      this.portion)  || '';
    };

    return Dish;
})();