
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
    descriptionChangeHandle: function(description){
        this.props.description = description;
        this.props.changeHandle && this.props.changeHandle(this.getDish());
    },
    portionChangeHandle: function(portion){
        this.props.portion = this.refs.portion.getProduct();
        this.calcPortion();
        this.forceUpdate();
        this.props.changeHandle && this.props.changeHandle(this.getDish());
    },
    fullChangeHandle: function(full){
        this.props.full = full;
        this.calcPortion();
        this.forceUpdate();
        this.props.changeHandle && this.props.changeHandle(this.getDish());
    },
    calcPortion: function(){
        this.calc(this.props.full, this.props.portion);
    },
    componentDidMount: function() {
        this.calcPortion();
    },
    calc: function(full, portion){
        var k = parseFloat(portion.mass) / parseFloat(full.mass);
        Product.fields.forEach(function(field){
            var id = field.id;
            if(field.type === 'number' && field.id !== 'mass'){
                portion[id] = (parseFloat(full[id]) * k).toFixed(2);
            }
        });
    },
    componentWillReceiveProps: function(nextProps) {
        this.calc(nextProps.full, nextProps.portion);
        this.forceUpdate();
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