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
    componentDidMount: function() {

    },
    render: function(){
        var norm = this.props.norm;
        var result = this.props.result;
        result.description = "Описание";
        result.details = "Детали";

        console.log(result, norm);

        return (
            <div className={this.props.className}>
                <div className="blankmyLabel"/>
                <div className='product norm inline-block'>
                    <div>
                        <input disabled className='disableForInput description item' value='Минимум'/>
                        <Product ref="minimum"
                                 hide=             {{mass: true, details: true, description: true}}
                                 enabled =         {{}}
                                 product =         {norm.min}/>
                    </div>
                    <div>
                        <input disabled className='disableForInput description item' value='Максимум'/>
                        <Product ref="maximum"
                                 hide=             {{mass: true, details: true, description: true}}
                                 enabled =         {{}}
                                 product = {norm.max}/>
                    </div>
                </div>
                <div className="result product">
                    <div className="myLabel item inline-block disableForInput">{"Итог"}</div>
                    <Product
                        danger =          {{
                                    proteins:       parseFloat(result.proteins)           > norm.max.proteins,
                                    triglyceride:   parseFloat(result.triglyceride)   > norm.max.triglyceride,
                                    carbohydrate:   parseFloat(result.carbohydrate)   > norm.max.carbohydrate,
                                    calorie:        parseFloat(result.calorie)             > norm.max.calorie
                                 }}
                        hide=             {{mass: true}}
                        enabled =         {{}}
                        ref =             {"result"}
                        product =         {result}/>
                </div>
            </div>
        );
    }
});

module.exports = DailyHead;