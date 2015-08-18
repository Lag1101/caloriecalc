/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

"use strict";

var socket = require('../socket');
var Product = require('./Product.react.js');

var DishProductList = React.createClass({
    getDefaultProps: function() {
        return {
            dishProducts: []
        };
    },
    changeHandle: function(i, product){

        //socket.emit('fixDishProduct', product);

        var changedProduct = this.props.dishProducts[i];

        changedProduct.proteins =       product.proteins;
        changedProduct.triglyceride =   product.triglyceride;
        changedProduct.carbohydrate =   product.carbohydrate;
        changedProduct.calorie =        product.calorie;
        changedProduct.mass =          product.mass;

        this.calcFull();
    },
    removeHandle: function(i){
        var products = this.props.dishProducts;
        var product = products[i];

        products.splice(i, 1);
        this.setState();
        //socket.emit('removeDishProduct', product._id);

        this.calcFull();
    },
    componentDidMount: function() {
        socket.emit('getCurrentDishProducts');
        socket.on('getCurrentDishProducts', function(data){
            this.props.dishProducts = data;
            this.calcFull();
            this.setState();
        }.bind(this));

        PubSub.subscribe( 'newDishProduct', function(msg, newProduct){
            var products = this.props.dishProducts;
            products.push(newProduct);
            this.calcFull();
            this.setState();
        }.bind(this));
    },
    getValue: function(cb){
        return this.props.dishProducts
    },
    calcFull: function(){
        var res = {
            proteins: 0.0,
            triglyceride: 0.0,
            carbohydrate: 0.0,
            calorie: 0.0
        };

       this.props.dishProducts.map(function(p){
           var mass = p.mass || 1.0;
           res.proteins += p.proteins * mass / 100;
           res.triglyceride += p.triglyceride * mass / 100;
           res.carbohydrate += p.carbohydrate * mass / 100;
           res.calorie += p.calorie * mass / 100;
       });

        PubSub.publish('ProductDishesChanged', res);
    },
    render: function() {

        var products = this.props.dishProducts.map(function (product, i) {
            return (
                <div className='product'
                     key =             {product._id}>

                    <input type='button' className='btn btn-xs btn-danger inline-block item' value='-' onClick={this.removeHandle.bind(this, i)}></input>
                    <div className='inline-block'>
                        <Product
                                hide=             {{details: true}}
                                enabled =         {{mass:true}}
                                ref =             {product._id}
                                changeHandle=     {this.changeHandle.bind(this, i)}
                                product={product}>
                        </Product>
                    </div>
                </div>
            );
        }.bind(this));

        return (
            <div className={this.props.className}>
                <p className='product inline-block'>Компоненты блюда</p>
                {products}
            </div>
        );
    }
});

//.render(
//    <DishProductList />,
//    document.getElementById('currentDishProducts')
//);

module.exports = DishProductList;