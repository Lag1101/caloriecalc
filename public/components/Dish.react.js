
var TextInput = require('./Input.react.js').TextInput;
var Product = require('./Product.react.js');

var Dish = React.createClass({
    getDish: function(){
        return {
            _id: this.props._id,
            description: this.props.description,
            portion: this.props.portion,
            full: this.props.full
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
        this.props.portion = this.refs.portion.getProduct();
        this.calcPortion();
        console.log(this.props.portion);
        this.props.changeHandle && this.props.changeHandle(this.getDish());
        this.forceUpdate();
    },
    fullChangeHandle: function(full){
        this.props.full = full;
        this.calcPortion();
        this.props.changeHandle && this.props.changeHandle(this.getDish());
        this.forceUpdate();
    },
    calcPortion: function(){
        var portion = this.props.portion,
            full = this.props.full;
        var k = portion.mass / full.mass;
        this.props.portion = {
            proteins:       (full.proteins * k),
            triglyceride:   (full.triglyceride * k),
            carbohydrate:   (full.carbohydrate * k),
            calorie:        (full.calorie * k),
            mass:           portion.mass
        };
    },
    componentDidMount: function() {
        var fullP =     this.props.full;
        var portionP =  this.props.portion;
        this.props.full = {
            proteins:       parseFloat(fullP.proteins || 0),
            triglyceride:   parseFloat(fullP.triglyceride || 0),
            carbohydrate:   parseFloat(fullP.carbohydrate || 0),
            calorie:        parseFloat(fullP.calorie || 0),
            mass:           parseFloat(fullP.mass)
        };
        this.props.portion = {
            proteins:       parseFloat(portionP.proteins || 0),
            triglyceride:   parseFloat(portionP.triglyceride || 0),
            carbohydrate:   parseFloat(portionP.carbohydrate || 0),
            calorie:        parseFloat(portionP.calorie || 0),
            mass:           parseFloat(portionP.mass)
        };
    },
    render: function() {
        var full =     this.props.full;
        var portion =  this.props.portion;

        var description = this.props.description;

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
                    product={full}>
                </Product>
                <Product
                    hide=             {{details: true, description: true}}
                    enabled =         {{mass:true}}
                    ref =             {'portion'}
                    changeHandle=     {this.portionChangeHandle}
                    product={portion}>
                </Product>
            </div>
        );
    }
});
module.exports = Dish;