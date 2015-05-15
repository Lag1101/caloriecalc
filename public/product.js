/**
 * Created by vasiliy.lomanov on 14.05.2015.
 */

var Product = (function(){
    function Product(product){
        this.constr(product);
    }

    Product.prototype.constr = function(product) {
        product = product || {};
        this.id =  (product.id ||  this.id) || '';
        this.description =  (product.description ||  this.description) || '';
        this.details =      (product.details ||      this.details)  || '';
        this.proteins =     (Product.validate(product.proteins) ||     this.proteins)  || 0;
        this.triglyceride = (Product.validate(product.triglyceride) || this.triglyceride)  || 0;
        this.carbohydrate = (Product.validate(product.carbohydrate) || this.carbohydrate)  || 0;
        this.calorie =      (Product.validate(product.calorie) ||      this.calorie)  || 0;
        this.mass =         (Product.validate(product.mass) ||         this.mass)  || 100;
    };
    Product.validate = function(s) {
        if(typeof(s) === "string") {
            var t = s.replace(',', '.');
            if( t[t.length-1] !== '.')
                return parseFloat(t);
            else
            return t;
        }
        return s;
    };
    Product.prototype.getRaw = function() {
        return {
            id:             this.id,
            description :   this.description,
            details :       this.details,
            proteins :      this.proteins,
            triglyceride :  this.triglyceride,
            carbohydrate :  this.carbohydrate,
            calorie :       this.calorie,
            mass :          this.mass
        }
    };
    Product.prototype.readEl = function(el){
        this.constr(el ? {
            description:        el.find('.description').html(),
            details:            el.find('.details').html(),
            proteins:           el.find('.proteins').val(),
            triglyceride:       el.find('.triglyceride').val(),
            carbohydrate:       el.find('.carbohydrate').val(),
            calorie:            el.find('.calorie').val(),
            mass:               el.find('.mass').val()
        } : {});
    };

    Product.prototype.writeEl = function(el){
        el.find('.description')     .html(this.description);
        el.find('.details')         .html(this.details);
        el.find('.proteins')        .val(this.proteins   .toFixed(2));
        el.find('.triglyceride')    .val(this.triglyceride   .toFixed(2));
        el.find('.carbohydrate')    .val(this.carbohydrate   .toFixed(2));
        el.find('.calorie')         .val(this.calorie   .toFixed(2));
        el.find('.mass')            .val(this.mass   .toFixed(2));
    };

    Product.emptyProduct = new Product();
    return Product;
})();