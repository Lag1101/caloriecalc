/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var utils = require('../../utils');
var socket = require('../../socket');
var TextInput = require('./Input.react').TextInput;
var NumericInput = require('./Input.react').NumericInput;

var Product = React.createClass({
    getProduct: function(){
        var refs = this.refs;
        return {
            id:              this.props.id,
            description:     refs.description.getValue(),
            proteins:        refs.proteins.getValue(),
            triglyceride:    refs.triglyceride.getValue(),
            carbohydrate:    refs.carbohydrate.getValue(),
            calorie:         refs.calorie.getValue(),
            mass:            refs.mass.getValue(),
            details:         refs.details.getValue()
        };
    },
    getDefaultProps: function() {
        return {
            hide:{},
            enabled:{all: true},
            danger: {}
        };
    },
    getInitialState: function() {
        return {

        }
    },
    changeHandle: function(){
        this.props.changeHandle && this.props.changeHandle(this.getProduct());
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
    componentDidMount: function(){

    },
    render: function() {
        var hide = this.props.hide;
        var enabled = this.props.enabled;
        var danger = this.props.danger;
        return (
            <div className='inline-block'>
                <TextInput    enabled={enabled.all || enabled.description}  danger={danger['description']}   css={'description item '}   changeHandle={this.changeHandle} value={this.props.description}      hidden={hide.description}          ref='description'></TextInput>
                <NumericInput enabled={enabled.all || enabled.proteins}     danger={danger['proteins']}   css={'proteins item '}      changeHandle={this.changeHandle} value={this.props.proteins}         hidden={hide.proteins}             ref='proteins'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.triglyceride} danger={danger['triglyceride']}   css={'triglyceride item '}  changeHandle={this.changeHandle} value={this.props.triglyceride}     hidden={hide.triglyceride}         ref='triglyceride'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.carbohydrate} danger={danger['carbohydrate']}   css={'carbohydrate item '}  changeHandle={this.changeHandle} value={this.props.carbohydrate}     hidden={hide.carbohydrate}         ref='carbohydrate'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.calorie}      danger={danger['calorie']}   css={'calorie item '}       changeHandle={this.changeHandle} value={this.props.calorie}          hidden={hide.calorie}              ref='calorie'></NumericInput>
                <NumericInput enabled={enabled.all || enabled.mass}         danger={danger['mass']}   css={'mass item '}          changeHandle={this.changeHandle} value={this.props.mass}             hidden={hide.mass}                 ref='mass'></NumericInput>
                <TextInput    enabled={enabled.all || enabled.details}      danger={danger['details']}   css={'details item '}      changeHandle={this.changeHandle} value={this.props.details}          hidden={hide.details}              ref='details'></TextInput>
            </div>
        );
    }
});

module.exports = Product;