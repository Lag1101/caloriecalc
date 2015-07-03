/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

"use strict";
var DishProductList = React.createClass({
    getDefaultProps: function() {
        return {
            originProducts: [],
            full: {
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0,
                mass: 100
            },
            portion: {
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0,
                mass: 100
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
    portionChanged: function(portion){
        this.calcPortion();
        this.setState();
    },
    fullChanged: function(portion){
        this.calcFull();
        this.setState();
    },
    calcDish: function(){
        this.calcFull();
        this.calcPortion();
        this.setState();
    },
    calcPortion(){
        var fullP =     this.props.full;
        var portionP =  this.refs.portion.getProduct();;
        var k = portionP.mass / fullP.mass;
        this.props.portion = {
            proteins:       fullP.proteins * k,
            triglyceride:   fullP.triglyceride * k,
            carbohydrate:   fullP.carbohydrate * k,
            calorie:        fullP.calorie * k,
            mass:           portionP.mass
        };
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
           res.proteins += p.proteins / mass;
           res.triglyceride += p.triglyceride / mass;
           res.carbohydrate += p.carbohydrate / mass;
           res.calorie += p.calorie / mass;
       });
        var fullP = this.refs.full.getProduct();

        res.proteins *= fullP.mass;
        res.triglyceride *= fullP.mass;
        res.carbohydrate *= fullP.mass;
        res.calorie *= fullP.mass;

        this.props.full = {
            proteins:       res.proteins,
            triglyceride:   res.triglyceride,
            carbohydrate:   res.carbohydrate,
            calorie:        res.calorie,
            mass:           fullP.mass
        };
    },
    render: function() {

        var products = this.props.originProducts.map(function (product) {
            return (
                <div className='product'
                     key =             {product._id}>

                    <input type='button' className='btn btn-xs btn-danger inline-block item' value='-' onClick={this.removeHandle.bind(this, product._id)}></input>
                    <div className='inline-block'>
                        <ReactProduct
                                hide=             {{details: true}}
                                enabled =         {true}
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
                        </ReactProduct>
                    </div>
                </div>
            );
        }.bind(this));

        var f = this.props.full;
        var full = (
            <div className="product" key =             {f._id}>
                <p>Полное блюдо</p>
                <ReactProduct
                    hide=             {{details: true}}
                    enabled =         {true}
                    ref =             {'full'}
                    changeHandle=     {this.fullChanged}
                    description =     {f.description}
                    proteins =        {f.proteins}
                    triglyceride =    {f.triglyceride}
                    carbohydrate =    {f.carbohydrate}
                    calorie =         {f.calorie}
                    mass =            {f.mass}>
                </ReactProduct>
            </div>
        );

        var p = this.props.portion;
        var portion = (
            <div className="product" key =             {f._id}>
                <p>Порция</p>
                <ReactProduct
                    hide=             {{details: true}}
                    enabled =         {true}
                    ref =             {'portion'}
                    changeHandle=     {this.portionChanged}
                    description =     {p.description}
                    proteins =        {p.proteins}
                    triglyceride =    {p.triglyceride}
                    carbohydrate =    {p.carbohydrate}
                    calorie =         {p.calorie}
                    mass =            {p.mass}>
                </ReactProduct>
            </div>
        );

        return (
            <div className="dishList">
                {full}
                {portion}
                {products}
            </div>
        );
    }
});

React.render(
    <DishProductList />,
    document.getElementById('currentDishProducts')
);