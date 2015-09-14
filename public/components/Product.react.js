/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var utils = require('../utils');
var socket = require('../socket');
var TextInput = require('./Input.react.js').TextInput;
var NumericInput = require('./Input.react.js').NumericInput;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var Product = React.createClass({
    mixins: [PureRenderMixin],
    getProduct: function(){
        var product = this.props.product;
        return {
            description: product.description,
            proteins: parseFloat(product.proteins),
            triglyceride: parseFloat(product.triglyceride),
            carbohydrate: parseFloat(product.carbohydrate),
            calorie: parseFloat(product.calorie),
            mass: parseFloat(product.mass),
            details: product.details
        };
    },
    getDefaultProps: function() {
        return {
            hide:{},
            enabled:{all: true},
            danger: {},
            product: {
                description: "",
                proteins: 0,
                triglyceride: 0,
                carbohydrate: 0,
                calorie: 0,
                mass: 0,
                details: ""
            }
        };
    },
    getInitialState: function() {
        return {

        }
    },
    changeHandle: function(){
        this.props.changeHandle && this.props.changeHandle(this.getProduct());
    },
    componentDidMount: function(){
        var product = this.props.product;
        this.props.product = {
            description:    product.description,
            proteins:       parseFloat(product.proteins || 0),
            triglyceride:   parseFloat(product.triglyceride || 0),
            carbohydrate:   parseFloat(product.carbohydrate || 0),
            calorie:        parseFloat(product.calorie || 0),
            mass:           parseFloat(product.mass || 0),
            details:        product.details
        };
    },
    makeDisabled: function(){
        var refs = this.refs;
        [
            refs.description,
            refs.proteins,
            refs.triglyceride,
            refs.carbohydrate,
            refs.calorie,
            refs.mass,
            refs.details
        ].map(function(ref){
                ref.makeDisabled();
            });
    },
    descriptionChanged:     function(v){this.props.product.description = v; this.changeHandle();},
    proteinsChanged:     function(v){this.props.product.proteins = v; this.changeHandle();},
    triglycerideChanged:     function(v){this.props.product.triglyceride = v; this.changeHandle();},
    carbohydrateChanged:     function(v){this.props.product.carbohydrate = v; this.changeHandle();},
    calorieChanged:     function(v){this.props.product.calorie = v; this.changeHandle();},
    massChanged:     function(v){this.props.product.mass = v; this.changeHandle();},
    detailsChanged:     function(v){this.props.product.details = v; this.changeHandle();},
    makeEnabled: function(){
        var refs = this.refs;
        [
            refs.description,
            refs.proteins,
            refs.triglyceride,
            refs.carbohydrate,
            refs.calorie,
            refs.mass,
            refs.details
        ].map(function(ref){
                ref.makeEnabled();
            });
    },
    clear : function(){
        var product = this.props.product;
        product.description = " ";
        product.proteins = 0;
        product.triglyceride = 0;
        product.carbohydrate = 0;
        product.calorie = 0;
        product.mass = 0;
        product.details = " ";

        this.setState();
    },
    render: function() {
        var hide = this.props.hide;
        var enabled = this.props.enabled;
        var danger = this.props.danger;
        var product = this.props.product;
        var viewProduct = {
            description : product.description || "",
            proteins : product.proteins || 0.0,
            triglyceride : product.triglyceride || 0.0,
            carbohydrate : product.carbohydrate || 0.0,
            calorie : product.calorie || 0.0,
            mass : product.mass || 0.0,
            details : product.details || ""
        };
        return (
            <div className=' input-group input-group-sm inline-block'>
                <TextInput    enabled={enabled.all || enabled.description}  danger={danger['description']}   css={'description item '}   changeHandle={this.descriptionChanged} value={viewProduct.description}      hidden={hide.description}          ref='description'></TextInput>
                <NumericInput enabled={enabled.all || enabled.proteins}     danger={danger['proteins']}   css={'proteins item '}      changeHandle={this.proteinsChanged} value={viewProduct.proteins}         hidden={hide.proteins}             ref='proteins'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.triglyceride} danger={danger['triglyceride']}   css={'triglyceride item '}  changeHandle={this.triglycerideChanged} value={viewProduct.triglyceride}     hidden={hide.triglyceride}         ref='triglyceride'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.carbohydrate} danger={danger['carbohydrate']}   css={'carbohydrate item '}  changeHandle={this.carbohydrateChanged} value={viewProduct.carbohydrate}     hidden={hide.carbohydrate}         ref='carbohydrate'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.calorie}      danger={danger['calorie']}   css={'calorie item '}       changeHandle={this.calorieChanged} value={viewProduct.calorie}          hidden={hide.calorie}              ref='calorie'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.mass}         danger={danger['mass']}   css={'mass item '}          changeHandle={this.massChanged} value={viewProduct.mass}             hidden={hide.mass}                 ref='mass'></NumericInput>
                <TextInput    enabled={enabled.all || enabled.details}      danger={danger['details']}   css={' details item '}      changeHandle={this.detailsChanged} value={viewProduct.details}          hidden={hide.details}              ref='details'></TextInput>
            </div>
        );
    }
});

module.exports = Product;