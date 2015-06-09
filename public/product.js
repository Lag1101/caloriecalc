/**
 * Created by vasiliy.lomanov on 14.05.2015.
 */

var Product = (function(){
    function Product(product){
        this.constr(product);
    }

    Product.prototype.constr = function(product) {
        product = product || {};
        this.id =  (product.id || product._id ||  this.id) || '';
        this.description =  (product.description ||  this.description) || '';
        this.details =      (product.details ||      this.details)  || '';
        this.proteins =     (Product.validate(product.proteins) ||     this.proteins)  || 0;
        this.triglyceride = (Product.validate(product.triglyceride) || this.triglyceride)  || 0;
        this.carbohydrate = (Product.validate(product.carbohydrate) || this.carbohydrate)  || 0;
        this.calorie =      (Product.validate(product.calorie) ||      this.calorie)  || 0;
        this.mass =         (Product.validate(product.mass) ||         this.mass)  || 100;
    };
    Product.validate = function(s) {
        var r = utils.validate(s);
        if(utils.isValid(r))
            return parseFloat(r);
        else
            return '';
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

    Product.prototype.writeEl = function(el, except){
        except = except || [];
        if(except.indexOf('description') < 0)
            el.find('.description')     .html(this.description);
        if(except.indexOf('details') < 0)
            el.find('.details')         .html(this.details);
        if(except.indexOf('proteins') < 0)
            el.find('.proteins')        .val(this.proteins   .toFixed(2));
        if(except.indexOf('triglyceride') < 0)
            el.find('.triglyceride')    .val(this.triglyceride   .toFixed(2));
        if(except.indexOf('carbohydrate') < 0)
            el.find('.carbohydrate')    .val(this.carbohydrate   .toFixed(2));
        if(except.indexOf('calorie') < 0)
            el.find('.calorie')         .val(this.calorie   .toFixed(2));
        if(except.indexOf('mass') < 0)
            el.find('.mass')            .val(this.mass   .toFixed(2));
    };
    Product.numericFields = [
        'proteins',
        'triglyceride',
        'carbohydrate',
        'calorie',
        'mass'
    ];
    Product.prototype.applyToNumerics = function(f){


        this.proteins = f(this.proteins, 'proteins');
        this.triglyceride = f(this.triglyceride, 'triglyceride');
        this.carbohydrate = f(this.carbohydrate, 'carbohydrate');
        this.calorie = f(this.calorie, 'calorie');
        this.mass = f(this.mass, 'mass');
    };

    Product.emptyProduct = new Product();
    return Product;
})();