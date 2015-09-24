/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var GeneralInput = require('./Input.react.js').GeneralInput;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var fields = [
    {
        id: 'description',
        type: 'text',
        default: ''
    },
    {
        id: 'proteins',
        type: 'number',
        default: 0.0
    },
    {
        id: 'triglyceride',
        type: 'number',
        default: 0.0
    },
    {
        id: 'carbohydrate',
        type: 'number',
        default: 0.0
    },
    {
        id: 'calorie',
        type: 'number',
        default: 0.0
    },
    {
        id: 'mass',
        type: 'number',
        default: 0.0
    },
    {
        id: 'details',
        type: 'text',
        default: ''
    }
];

var Product = React.createClass({
    statics: {
        fields: fields
    },
    mixins: [PureRenderMixin],
    getProduct: function(){
        var res = {};
        var product = this.props.product;
        fields.forEach(function(field){
            res[field.id] = product[field.id];
        });
        return res;
    },
    getDefaultProps: function() {
        var defaultProduct = {};
        fields.forEach(function(field){
            defaultProduct[field.id] = field.default;
        });
        return {
            hide:{},
            enabled:{all: true},
            danger: {},
            product: defaultProduct
        };
    },
    changeHandle: function(){
        this.props.changeHandle && this.props.changeHandle(this.getProduct());
    },
    makeDisabled: function(){
        var refs = this.refs;
        fields.forEach(function(field){
            refs[field.id].makeDisabled();
        });
    },
    fieldChanged: function(field, v){
        this.props.product[field.id] = v;
        this.changeHandle();
    },
    makeEnabled: function(){
        var refs = this.refs;
        fields.forEach(function(field){
            refs[field.id].makeEnabled();
        });
    },
    clear : function(){
        var product = this.props.product;

        fields.forEach(function(field){
            product[field.id] = field.default;
        });

        this.forceUpdate();
    },
    render: function() {
        var hide = this.props.hide;
        var enabled = this.props.enabled;
        var danger = this.props.danger;
        var product = this.props.product;

        var viewFields = fields.map(function(field){
            var id = field.id;

            if(hide[id]) return;

            var e = enabled.all || enabled[id];
            var d = danger[id];
            var css = id + ' item ';
            var value = product[id];

            return (
                <GeneralInput
                    type = {field.type}
                    enabled = {e}
                    danger = {d}
                    css = {css}
                    changeHandle = {this.fieldChanged.bind(this, field)}
                    value = {value}
                    ref = {id}
                    key = {id}
                    />
            );
        }, this);

        return (
            <div className=' input-group input-group-sm inline-block'>
                {viewFields}
            </div>
        );
    }
});

module.exports = Product;