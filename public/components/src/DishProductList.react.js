/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

"use strict";

var Product = require('./Product.react');

var DishProductList = React.createClass({
    getDefaultProps: function() {
        return {
            originProducts: [],
            sum: {
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0
            }
        };
    },
    newProduct: function(){
        var newProduct = this.refs.newProduct.getProduct();
        console.log('Added', newProduct);
        socket.emit('newProduct', newProduct);
    },
    changeHandle: function(product){

        socket.emit('fixDishProduct', product);
        var products = this.props.originProducts;
        for(var i = products.length; i--; )
        {
            if(product.id === products[i]._id){
                products[i].proteins =       product.proteins;
                products[i].triglyceride =   product.triglyceride;
                products[i].carbohydrate =   product.carbohydrate;
                products[i].calorie =        product.calorie;
                products[i].mass =          product.mass;
                break;
            }
        }
        this.calcDish();
    },
    removeHandle: function(id){
        var products = this.props.originProducts;
        for(var i = products.length; i--; )
        {
            if(id === products[i]._id){
                products.splice(i, 1);
                this.setState();
                socket.emit('removeDishProduct', id);
                break;
            }
        }
        this.calcDish();
    },
    componentDidMount: function() {
        socket.emit('getCurrentDishProducts');
        socket.on('getCurrentDishProducts', function(data){
            this.props.originProducts = data;
            this.calcDish();
        }.bind(this));

        socket.on('newDishProduct', function(newProduct){
            var products = this.props.originProducts;
            products.push(newProduct);
            this.calcDish();
        }.bind(this));
    },
    calcDish: function(){
        this.calcFull();
        this.props.sumChanged && this.props.sumChanged(this.props.sum);
        this.setState();
    },
    calcFull: function(){
        var res = {
            proteins: 0.0,
            triglyceride: 0.0,
            carbohydrate: 0.0,
            calorie: 0.0
        };

       this.props.originProducts.map(function(p){
           var mass = p.mass || 1.0;
           res.proteins += p.proteins * mass / 100;
           res.triglyceride += p.triglyceride * mass / 100;
           res.carbohydrate += p.carbohydrate * mass / 100;
           res.calorie += p.calorie * mass / 100;
       });

        this.props.sum.proteins = res.proteins;
        this.props.sum.triglyceride = res.triglyceride;
        this.props.sum.carbohydrate = res.carbohydrate;
        this.props.sum.calorie = res.calorie;
    },
    render: function() {

        var products = this.props.originProducts.map(function (product) {
            return (
                <div className='product'
                     key =             {product._id}>

                    <input type='button' className='btn btn-xs btn-danger inline-block item' value='-' onClick={this.removeHandle.bind(this, product._id)}></input>
                    <div className='inline-block'>
                        <Product
                                hide=             {{details: true}}
                                enabled =         {{mass:true}}
                                ref =             {product._id}
                                changeHandle=     {this.changeHandle}
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