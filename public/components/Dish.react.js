
var TextInput = require('./Input.react.js').TextInput;
var Product = require('./Product.react.js');
var React = require('react');

var Dish = React.createClass({
    getDish: function(){
        return {
            id: this.props.id,
            description: this.props.description,
            portion: this.refs.portion.getProduct(),
            full: this.refs.full.getProduct()
        }
    },
    getDefaultProps: function() {
        return {
            hideDescription: false,
            description: "",
            full: {mass: 100},
            portion: {mass: 100}
        };
    },
    getInitialState: function() {
        return {
            //full: this.props.full,
            //portion: this.props.portion
        }
    },
    descriptionChangeHandle: function(description){
        this.props.description = description;
        this.props.changeHandle && this.props.changeHandle(this.getDish());
    },
    portionChangeHandle: function(portion){
        this.props.portion = portion;
        this.setState();
        this.props.changeHandle && this.props.changeHandle(this.getDish());
    },
    fullChangeHandle: function(full){
        this.props.full = full;
        this.setState();
        this.props.changeHandle && this.props.changeHandle(this.getDish());
    },
    componentDidMount: function() {

    },
    render: function() {
        var fullP =     this.props.full;
        var portionP =  this.props.portion;

        var description = this.props.description;

        var full = {
            proteins:       parseFloat(this.props.full.proteins || 0).toFixed(2),
            triglyceride:   parseFloat(this.props.full.triglyceride || 0).toFixed(2),
            carbohydrate:   parseFloat(this.props.full.carbohydrate || 0).toFixed(2),
            calorie:        parseFloat(this.props.full.calorie || 0).toFixed(2),
            mass:           fullP.mass
        };

        var k = portionP.mass / fullP.mass;
        var portion = {
            proteins:       (this.props.full.proteins * k).toFixed(2),
            triglyceride:   (this.props.full.triglyceride * k).toFixed(2),
            carbohydrate:   (this.props.full.carbohydrate * k).toFixed(2),
            calorie:        (this.props.full.calorie * k).toFixed(2),
            mass:           portionP.mass
        };

        var descriptionCSS = 'description item';
        if(this.props.hideDescription)
            descriptionCSS += ' hidden ';
        return (
            <div className={this.props.className}>
                <TextInput  enabled={true}  css={descriptionCSS}   changeHandle={this.descriptionChangeHandle} value={description}        ref='description'></TextInput>
                <Product
                    hide=             {{details: true, description: true}}
                    enabled =         {{mass:true}}
                    ref =             {'full'}
                    changeHandle=     {this.fullChangeHandle}
                    proteins =        {full.proteins}
                    triglyceride =    {full.triglyceride}
                    carbohydrate =    {full.carbohydrate}
                    calorie =         {full.calorie}
                    mass =            {full.mass}>
                </Product>
                <Product
                    hide=             {{details: true, description: true}}
                    enabled =         {{mass:true}}
                    ref =             {'portion'}
                    changeHandle=     {this.portionChangeHandle}
                    proteins =        {portion.proteins}
                    triglyceride =    {portion.triglyceride}
                    carbohydrate =    {portion.carbohydrate}
                    calorie =         {portion.calorie}
                    mass =            {portion.mass}>
                </Product>
            </div>
        );
    }
});
module.exports = Dish;