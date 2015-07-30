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
    newDishHandle: function(){
        var newDish = this.refs.dish.getDish()
        socket.emit('addDish', newDish);
        console.log(newDish);
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

        this.props.full.proteins = res.proteins;
        this.props.full.triglyceride = res.triglyceride;
        this.props.full.carbohydrate = res.carbohydrate;
        this.props.full.calorie = res.calorie;
    },
    defaultDishChanged: function(dish){
        this.props.full = dish.full;
        this.props.portion = dish.portion;
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
                        </ReactProduct>
                    </div>
                </div>
            );
        }.bind(this));

        return (
            <div className={this.props.className}>
                <div className='defaultDish product inline-block'>
                    <button className='save item btn btn-xs btn-default'
                            onClick={this.newDishHandle}>
                        <i className='glyphicon glyphicon-floppy-disk'/>
                    </button>
                    <ReactDish
                        hideDescription = {true}
                        ref = 'dish'
                        description = {""}
                        full={this.props.full}
                        portion={this.props.portion}
                        changeHandle={this.defaultDishChanged}/>
                </div>
                {products}
            </div>
        );
    }
});

//React.render(
//    <DishProductList />,
//    document.getElementById('currentDishProducts')
//);