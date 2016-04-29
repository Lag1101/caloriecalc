/**
 * Created by vasiliy.lomanov on 10.08.2015.
 */

var utils = require('../utils');
var Product = require('./Product.react.js');
var NumericInput = require('./Input.react.js').NumericInput;
var DailyHead = require('./DailyHead.react.js');

var Panel = ReactBootstrap.Panel;
var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var Daily = React.createClass({
    getDefaultProps: function() {
        return {
            daily: {
                "" : {
                    additional: [],
                    main: []
                }
            },
            date: ""
        }
    },
    addHandle: function(){
        var newProduct = this.refs.newProduct.getProduct();

        this.refs.newProduct.clear();
        this.currentDay().additional.push(newProduct);
        this.forceUpdate();
    },
    mainChangeHandle: function(i, product){
        var parts = this.currentDay().main;
        product._id = parts[i]._id;
        parts[i] = product;
        this.forceUpdate();
    },
    addChangeHandle: function(i, product){
        var parts = this.currentDay().additional;
        product._id = parts[i]._id;
        parts[i] = product;
        this.forceUpdate();
    },
    removeHandle: function(i, productToRemove){
        var additionalParts = this.currentDay().additional;
        additionalParts.splice(i, 1);
        this.forceUpdate();
    },
    currentDay: function(){
        return this.props.daily[this.props.date];
    },
    recalc: function(){
        var res = {
            proteins: 0.0,
            triglyceride: 0.0,
            carbohydrate: 0.0,
            calorie: 0.0
        };
        var day = this.currentDay();
        day.main.map(function(p){
            Product.fields.forEach(function(field){
                var id = field.id;
                if(field.type === 'number' && id !== 'mass')
                    res[id] += parseFloat(p[id]);
            });
        });
        day.additional.map(function(p){
            Product.fields.forEach(function(field){
                var id = field.id;
                if(field.type === 'number' && id !== 'mass')
                    res[id] += parseFloat(p[id]);
            });
        });

        this.props.result = {};
        Product.fields.forEach(function(field){
            var id = field.id;
            if(field.type === 'number' && id !== 'mass')
                this.props.result[id] = res[id].toFixed(2);
        }, this);
    },
    statics: {
        dayPartNames: [
            'Завтрак',
            'Ланч',
            'Обед',
            'Перекус',
            'Ужин',
            'Перед сном'
        ]
    },
    getDayPartNames: function(){
        return   this.constructor.dayPartNames;
    },
    componentWillUpdate: function(){

    },
    componentDidMount: function() {
        PubSub.subscribe( 'newDailyProduct', function(msg, newProduct){
            this.addTo(newProduct.dayPartName, newProduct.portion);
            this.forceUpdate();
        }.bind(this));
    },
    dateChanged: function(){
        var date = this.refs.date.getValue();
        this.props.date = date;
        console.log(this.props.date);

        $.post({
            url: window.location.href + "/setCurrentDate",
            data: {data: date},
            success: function(day){
                this.props.daily[day.date] = day;
                this.forceUpdate();
            }.bind(this)
        });
    },
    getValue: function(){
        return this.props.daily;
    },
    addTo: function(dayPartName, newProduct){
        if('additional' === dayPartName){
            this.currentDay().additional.push(newProduct);
        } else {
            this.currentDay().main.forEach(function(product, i){
                if( dayPartName !== this.constructor.dayPartNames[i] ) return;

                Product.fields.forEach(function(field){
                    var id = field.id;
                    if(field.type === 'number' && id !== 'mass')
                        product[id] = (parseFloat(product[id]) + parseFloat(newProduct[id])).toFixed(2)
                });

            }, this);
        }
    },
    render: function(){
        this.recalc();

        var dayPartNames = this.getDayPartNames();

        var dayView = this.currentDay().main.map(function(product, i){
            return (
                <div key={i}>
                    <div className="product">
                        <div className="myLabel item inline-block disableForInput">{dayPartNames[i]}</div>
                        <div className="inline-block">

                            <Product
                                hide=             {{mass: true}}
                                enabled =         {{all:true}}
                                //ref =             {dayPart.ref}
                                changeHandle=     {this.mainChangeHandle.bind(this, i)}
                                product=          {product}>
                            </Product>
                        </div>
                    </div>
                </div>
            );
        }.bind(this));


        var additionalPartsView = this.currentDay().additional.map(function(product, i){
            return (
                <div>
                    <div className="product" key={i}>
                        <button className='btn btn-xs btn-default inline-block item myLabel' onClick={this.removeHandle.bind(this, i, product)}><i>-</i></button>
                        <div className="inline-block">

                            <Product
                                hide=             {{mass: true}}
                                enabled =         {{all:true}}
                                //ref =             {dayPart.ref}
                                changeHandle=     {this.addChangeHandle.bind(this, i)}
                                product={product}>
                            </Product>
                        </div>
                    </div>
                </div>
            );
        }.bind(this));

        var header = (
            <Row>
                <Col xs={6}>
                    <p></p>
                    Расписание на день
                </Col>
                <Col xs={6}>
                    <Input ref="date" type='date' className='dailyDate' value={this.props.date} onChange={this.dateChanged}/>
                </Col>
            </Row>
        );

        return (
            <Panel bsStyle="primary" header={header} className="inline-block myTable">
                <DailyHead
                    result = {this.props.result}
                    norm = {this.props.norm}/>
                {dayView}
                {additionalPartsView}

                <div className="newItem product">
                    <button className="myLabel item btn btn-xs btn-default" onClick={this.addHandle}><i>+</i></button>
                    <Product
                        hide=             {{mass: true}}
                        enabled =         {{all:true}}
                        ref =             {"newProduct"}/>
                </div>
            </Panel>
        );
    }
});

module.exports = Daily;