/**
 * Created by vasiliy.lomanov on 10.08.2015.
 */

var utils = require('../utils');
var socket = require('../socket');
var Product = require('./Product.react.js');
var NumericInput = require('./Input.react.js').NumericInput;
var DailyHead = require('./DailyHead.react.js');
var React = require('react');

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
        this.update();

        //socket.emit('addDailyProduct', this.props.date, newProduct);
    },
    mainChangeHandle: function(i, product){
        var parts = this.currentDay().main;
        product._id = parts[i]._id;
        parts[i] = product;
        this.recalc();
        //socket.emit('fixDailyProduct', this.props.date, product);
    },
    addChangeHandle: function(i, product){
        var parts = this.currentDay().additional;
        product._id = parts[i]._id;
        parts[i] = product;
        this.recalc();
        //socket.emit('fixDailyProduct', this.props.date, product);
    },
    removeHandle: function(i, productToRemove){
        var additionalParts = this.currentDay().additional;
        additionalParts.splice(i, 1);
        this.update();
        //socket.emit('removeDailyProduct', this.props.date, productToRemove._id);
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
            res.proteins += parseFloat(p.proteins);
            res.triglyceride += parseFloat(p.triglyceride);
            res.carbohydrate += parseFloat(p.carbohydrate);
            res.calorie += parseFloat(p.calorie);
        });
        day.additional.map(function(p){
            res.proteins += parseFloat(p.proteins);
            res.triglyceride += parseFloat(p.triglyceride);
            res.carbohydrate += parseFloat(p.carbohydrate);
            res.calorie += parseFloat(p.calorie);
        });

        PubSub.publish('DailyChanged', {
            proteins: parseFloat(res.proteins.toFixed(2)),
            triglyceride: parseFloat(res.triglyceride.toFixed(2))
            ,
            carbohydrate: parseFloat(res.carbohydrate.toFixed(2)),
            calorie: parseFloat(res.calorie.toFixed(2))
        });
    },
    componentDidMount: function() {

        socket.emit('getCurrentDate');
        socket.on('getCurrentDate', function(date){
            this.props.date = date;
            socket.emit('getDaily', date);
        }.bind(this));
        socket.on('getDaily', function(day){
            this.props.daily[day.date] = day;
            this.update();
        }.bind(this));
        //socket.on('addDailyProduct', function(date, newDailyProduct){
        //    if(date ===  this.props.date){
        //        this.props.additionalParts.push(newDailyProduct);
        //        this.update();
        //    }
        //}.bind(this));
    },
    dateChanged: function(){
        var date = this.refs.date.getDOMNode().value;
        this.props.date = date;
        console.log(this.props.date);

        socket.emit('setCurrentDate', date);
        if(!this.props.daily[date])
            socket.emit('getDaily', date);
        else {
            this.update();
        }
    },
    update: function(){
        this.recalc();
        this.setState();
    },
    getValue: function(){
        return this.props.daily;
    },
    render: function(){
        var dayPartName = [
            'Завтрак',
            'Ланч',
            'Обед',
            'Перекус',
            'Ужин',
            'Перед сном'];

        var dayView = this.currentDay().main.map(function(product, i){
            return (
                <div key={i}>
                    <div className="product">
                        <div className="myLabel item inline-block disableForInput">{dayPartName[i]}</div>
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
                        <button className='btn btn-xs btn-danger inline-block item myLabel' onClick={this.removeHandle.bind(this, i, product)}><i>-</i></button>
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

        return (
            <div className={this.props.className}>
                <div>
                    <div className='product inline-block'>
                        <input ref="date" type='date' className='dailyDate' value={this.props.date} onChange={this.dateChanged}/>
                    </div>
                </div>
                <DailyHead/>
                {dayView}
                {additionalPartsView}

                <div className="newItem product">
                    <button className="myLabel item btn btn-xs btn-default" onClick={this.addHandle}><i>+</i></button>
                    <Product
                        hide=             {{mass: true}}
                        enabled =         {{all:true}}
                        ref =             {"newProduct"}/>
                </div>
            </div>
        );
    }
});

module.exports = Daily;