/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

"use strict";
var DishProductList = React.createClass({
    getInitialState: function() {
        return {
            products: this.props.originProducts,
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
        }
    },
    getDefaultProps: function() {
        return {
            originProducts: []

        };
    },
    newProduct: function(){
        var newProduct = this.refs.newProduct.getProduct();
        console.log('Added', newProduct);
        socket.emit('newProduct', newProduct);
    },
    dishChanged: function(full){
        this.calcResultDish();
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
        this.calcResultDish();
    },
    removeHandle: function(id){
        var products = this.props.originProducts;
        for(var i = products.length; i--; )
        {
            if(id === products[i]._id){
                products.splice(i, 1);
                this.setState({products: products});
                socket.emit('removeDishProduct', id);
                break;
            }
        }
        this.calcResultDish();
    },
    componentDidMount: function() {
        socket.emit('getCurrentDishProducts');
        socket.on('getCurrentDishProducts', function(data){
            this.props.originProducts = data;
            this.calcResultDish();
            this.setState({products: data})
        }.bind(this));

        socket.on('newDishProduct', function(newProduct){
            var products = this.props.originProducts;
            products.push(newProduct);
            this.calcResultDish();
            this.setState({products: products})
        }.bind(this));
    },
    calcResultDish: function(){
        "use strict";
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
        var portionP = this.refs.portion.getProduct();

        var k = 1;//portionP.mass / fullP.mass;

        this.setState({
            full: {
                proteins:       res.proteins,
                triglyceride:   res.triglyceride,
                carbohydrate:   res.carbohydrate,
                calorie:        res.calorie
            },
            portion: {
                proteins:       res.proteins * k,
                triglyceride:   res.triglyceride * k,
                carbohydrate:   res.carbohydrate * k,
                calorie:        res.calorie * k
            }
        });

    },
    render: function() {

        var products = this.state.products.map(function (product) {
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

        this.state.full._id = 'full';
        this.state.portion._id = 'portion';
        var dish = [this.state.full, this.state.portion].map(function(f){
            return (
                <div className="product" key =             {f._id}>
                    <p>{f._id}</p>
                    <ReactProduct
                        hide=             {{details: true}}
                        enabled =         {true}
                        ref =             {f._id}
                        changeHandle=     {this.dishChanged}
                        id =              {f._id}
                        description =     {f.description}
                        proteins =        {f.proteins}
                        triglyceride =    {f.triglyceride}
                        carbohydrate =    {f.carbohydrate}
                        calorie =         {f.calorie}
                        mass =            {f.mass}
                        details =         {f.details}>
                    </ReactProduct>
                </div>
            );
        }.bind(this));

        return (
            <div className="dishList">
                {dish}
                {products}
            </div>
        );
    }
});

React.render(
    <DishProductList />,
    document.getElementById('currentDishProducts')
);