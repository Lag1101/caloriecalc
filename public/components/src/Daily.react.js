/**
 * Created by vasiliy.lomanov on 10.08.2015.
 */

var utils = require('../../utils');
var socket = require('../../socket');
var Product = require('./Product.react');
var NumericInput = require('./Input.react').NumericInput;

var Daily = React.createClass({
    getDefaultProps: function() {
        return {
            result:{
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0
            },
            dayParts: [],
            additionalParts: [],
            date: "",
            norm: {
                min: {},
                max: {}
            }
        }
    },
    addHandle: function(){
        var newProduct = this.refs.new.getProduct();
        socket.emit('addDailyProduct', this.props.date, newProduct);
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
    removeHandle: function(i, productToRemove){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + productToRemove.description + " ?",
            this.removeProduct.bind(this, i, productToRemove)
        );
    },
    removeProduct: function(i, productToRemove){
        var additionalParts = this.props.additionalParts;
        additionalParts.splice(i, 1);
        this.update();
        socket.emit('removeDailyProduct', this.props.date, productToRemove._id);
    },
    recalc: function(){
        var res = {
            proteins: 0.0,
            triglyceride: 0.0,
            carbohydrate: 0.0,
            calorie: 0.0
        };

        this.props.dayParts.map(function(p){
            res.proteins += parseFloat(p.proteins);
            res.triglyceride += parseFloat(p.triglyceride);
            res.carbohydrate += parseFloat(p.carbohydrate);
            res.calorie += parseFloat(p.calorie);
        });
        this.props.additionalParts.map(function(p){
            res.proteins += parseFloat(p.proteins);
            res.triglyceride += parseFloat(p.triglyceride);
            res.carbohydrate += parseFloat(p.carbohydrate);
            res.calorie += parseFloat(p.calorie);
        });

        this.props.result = res;
    },
    componentDidMount: function() {

        socket.emit('getNorm');
        socket.emit('getCurrentDate');
        socket.on('getCurrentDate', function(date){
            this.props.date = date;
            socket.emit('getDaily', date);
        }.bind(this));

        socket.on('getDaily', function(day) {
            this.props.dayParts = day.main;
            this.props.additionalParts = day.additional || [];
            this.update();
        }.bind(this));

        socket.on('addDailyProduct', function(date, newDailyProduct){
            if(date ===  this.props.date){
                this.props.additionalParts.push(newDailyProduct);
                this.update();
            }
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
    dateChanged: function(){
        this.props.date = React.findDOMNode(this.refs.date).value;
        console.log(this.props.date);
        socket.emit('setCurrentDate', this.props.date);
    },
    update: function(){
        this.recalc();
        this.setState();
    },
    render: function(){
        var dayPartName = [
            'Завтрак У40-50',
            'Ланч У20-30',
            'Обед У20-30',
            'Перекус У15',
            'Ужин У10',
            'Перед сном У10'];
        var norm = this.props.norm;
        var result = this.props.result;

        var dayView = this.props.dayParts.map(function(product, i){
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
                                id =              {product._id}
                                description =     {product.description}
                                proteins =        {product.proteins}
                                triglyceride =    {product.triglyceride}
                                carbohydrate =    {product.carbohydrate}
                                calorie =         {product.calorie}
                                mass =            {product.mass}
                                details =         {product.details}>
                            </Product>
                        </div>
                    </div>
                </div>
            );
        }.bind(this));


        var additionalPartsView = this.props.additionalParts.map(function(product, i){
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
                                id =              {product._id}
                                description =     {product.description}
                                proteins =        {product.proteins}
                                triglyceride =    {product.triglyceride}
                                carbohydrate =    {product.carbohydrate}
                                calorie =         {product.calorie}
                                mass =            {product.mass}
                                details =         {product.details}>
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
                                    proteins: result.proteins > norm.max.proteins,
                                    triglyceride: result.triglyceride > norm.max.triglyceride,
                                    carbohydrate: result.carbohydrate > norm.max.carbohydrate,
                                    calorie: result.calorie > norm.max.calorie
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
                {dayView}
                {additionalPartsView}

                <div className="newItem product">
                    <button className="myLabel item btn btn-xs btn-default" onClick={this.addHandle}><i>+</i></button>
                    <Product
                        hide=             {{mass: true}}
                        enabled =         {{all:true}}
                        ref =             {"new"}/>
                </div>
            </div>
        );
    }
});

module.exports = Daily;