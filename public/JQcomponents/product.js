/**
 * Created by vasiliy.lomanov on 20.08.2015.
 */

var fields = [
    {
        name: "description",
        type: "text",
        default: ""
    },
    {
        name: "proteins",
        type: "number",
        default: 0
    },
    {
        name: "triglyceride",
        type: "number",
        default: 0
    },
    {
        name: "carbohydrate",
        type: "number",
        default: 0
    },
    {
        name: "calorie",
        type: "number",
        default: 0
    },
    {
        name: "mass",
        type: "number",
        default: 100
    },
    {
        name: "details",
        type: "text",
        default: ""
    }
];

var namedFields = {};
(function(){
    for(var i = 0; i < fields.length; i++){
        namedFields[fields[i].name] = fields[i];
    }
})();

function Product(product, callbacks){
    product = product || {};

    this.callbacks = callbacks;
    this.$fields = [];

    fields.forEach(function(field){
        this[field.name] = product[field.name] || field.default;
    }, this);
}

Product.prototype.linkView = function($view){
    this.$fields = fields.map(function(field){
        var $field = $view.find('.'+field.name);
        $field.on('paste input', this.changeHandle.bind(this, field, $field));
        $field.val(this[field.name]);
        if(field.type === "number")
            Product.validateNumberInput($field);

        return $field;
    }, this);
};

Product.validateNumberInput = function($field){
    var str = $field.val();

    str = str.replace(',', '.').replace(/[^\d\.]/g, '');

    if (isNaN(parseFloat(str))) {
        $field.removeClass('label-success').addClass('label-danger');
    } else {
        $field.addClass('label-success').removeClass('label-danger');
    }
    $field.val(str);
};

Product.prototype.changeHandle = function(field, $field, v){
    if(field.type === "number")
        Product.validateNumberInput($field);

    if(!this.callbacks || !this.callbacks[field.name]) return;
        this.callbacks[field.name]($field.val());
};

Product.prototype.enabled = function(e){
    this.$fields.forEach(function($field){
        $field.attr('disabled', !e);
    }, this);
};

module.exports = Product;