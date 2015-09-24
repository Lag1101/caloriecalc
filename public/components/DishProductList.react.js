/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

"use strict";

var Panel = ReactBootstrap.Panel;
var Product = require('./Product.react.js');
var Button = ReactBootstrap.Button;

var DishProductList = React.createClass({
    getDefaultProps: function() {
        return {
            dishProducts: []
        };
    },
    changeHandle: function(i, product){

        var changedProduct = this.props.dishProducts[i];

        changedProduct.proteins =       product.proteins;
        changedProduct.triglyceride =   product.triglyceride;
        changedProduct.carbohydrate =   product.carbohydrate;
        changedProduct.calorie =        product.calorie;
        changedProduct.mass =          product.mass;

        this.forceUpdate();
    },
    removeHandle: function(i){
        var products = this.props.dishProducts;
        products.splice(i, 1);
        this.forceUpdate();
    },
    componentDidMount: function() {
        PubSub.subscribe( 'newDishProduct', function(msg, newProduct){
            var products = this.props.dishProducts;
            products.push(newProduct);
            this.forceUpdate();
        }.bind(this));
    },
    componentDidUpdate: function(){
        this.calcFull();
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
           var mass = parseFloat(p.mass || 100.0);

           Product.fields.forEach(function(field){
               var id = field.id;
               if(field.type === 'number' && id !== 'mass')
                    res[id] +=      parseFloat(p[id]) * mass / 100;
           });
        });

        Product.fields.forEach(function(field){
            var id = field.id;
            if(field.type === 'number' && id !== 'mass')
                res[id] = res[id].toFixed(2);
        });

        PubSub.publish('ProductDishesChanged', res);
    },
    render: function() {

        var products = this.props.dishProducts.map(function (product, i) {
            return (
                <div className='product'
                     key =             {product._id}>

                    <Button bsSize='xsmall' bsStyle='default' className='item' onClick={this.removeHandle.bind(this, i)}>-</Button>
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

        var header = (
            <p>Компоненты блюда</p>
        );
        return (
            <Panel bsStyle="primary" header={header} className="inline-block myTable">
                {products}
            </Panel>
        );
    }
});

//.render(
//    <DishProductList />,
//    document.getElementById('currentDishProducts')
//);

module.exports = DishProductList;