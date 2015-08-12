/**
 * Created by vasiliy.lomanov on 12.08.2015.
 */
/**
 * Created by vasiliy.lomanov on 10.08.2015.
 */

var socket = require('../socket');
var Product = require('./Product.react.js');

var DailyHead = React.createClass({
    getDefaultProps: function() {
        return {
            result:{
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0
            },
            norm: {
                min: {},
                max: {}
            }
        }
    },
    mainChangeHandle: function(i, product){
        var parts = this.props.dayParts;
        product._id = parts[i]._id;
        parts[i] = product;
        this.update();
        socket.emit('fixDailyProduct', this.props.date, product);
    },
    addChangeHandle: function(i, product){
        var parts = this.props.additionalParts;
        product._id = parts[i]._id;
        parts[i] = product;
        this.update();
        socket.emit('fixDailyProduct', this.props.date, product);
    },
    componentDidMount: function() {

        socket.emit('getNorm');

        socket.on('addDailyProduct', function(date, newDailyProduct){
            if(date ===  this.props.date){
                this.props.additionalParts.push(newDailyProduct);
                this.update();
            }
        }.bind(this));

        PubSub.subscribe( 'DailyChanged', function(msg, newSum){
            this.props.result = newSum;
            this.setState();
        }.bind(this));

        socket.on('getNorm', function(newNorm){
            var norm = this.props.norm;
            norm.min = {
                proteins: newNorm.proteins.min,
                triglyceride: newNorm.triglyceride.min,
                carbohydrate: newNorm.carbohydrate.min,
                calorie: newNorm.calorie.min
            };
            norm.max = {
                proteins: newNorm.proteins.max,
                triglyceride: newNorm.triglyceride.max,
                carbohydrate: newNorm.carbohydrate.max,
                calorie: newNorm.calorie.max
            };
            this.setState();
        }.bind(this));
    },
    render: function(){
        var norm = this.props.norm;
        var result = this.props.result;

        return (
            <div className={this.props.className}>
                <div className="blankmyLabel"/>
                <div className='product norm inline-block'>
                    <div>
                        <input disabled className='description item' value='Минимум'/>
                        <Product ref="minimum"
                                 hide=             {{mass: true, details: true, description: true}}
                                 enabled =         {{}}
                                 proteins =        {norm.min.proteins}
                                 triglyceride =    {norm.min.triglyceride}
                                 carbohydrate =    {norm.min.carbohydrate}
                                 calorie =         {norm.min.calorie}/>
                    </div>
                    <div>
                        <input disabled className='description item' value='Максимум'/>
                        <Product ref="maximum"
                                 hide=             {{mass: true, details: true, description: true}}
                                 enabled =         {{}}
                                 proteins =        {norm.max.proteins}
                                 triglyceride =    {norm.max.triglyceride}
                                 carbohydrate =    {norm.max.carbohydrate}
                                 calorie =         {norm.max.calorie}/>
                    </div>
                </div>
                <div className="result product">
                    <div className="myLabel item inline-block disableForInput">{"Итог"}</div>
                    <Product
                        danger =          {{
                                    proteins: result.proteins           > norm.max.proteins,
                                    triglyceride: result.triglyceride   > norm.max.triglyceride,
                                    carbohydrate: result.carbohydrate   > norm.max.carbohydrate,
                                    calorie: result.calorie             > norm.max.calorie
                                 }}
                        hide=             {{mass: true}}
                        enabled =         {{}}
                        ref =             {"result"}
                        description =     {"Описание"}
                        proteins =        {result.proteins}
                        triglyceride =    {result.triglyceride}
                        carbohydrate =    {result.carbohydrate}
                        calorie =         {result.calorie}
                        mass =            {result.mass}
                        details =         {"Детали"}/>
                </div>
            </div>
        );
    }
});

module.exports = DailyHead;