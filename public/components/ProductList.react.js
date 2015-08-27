/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var utils = require('../utils');
var socket = require('../socket');
var Product = require('./Product.react.js');
var Sorting = require('./Sorting.react.js');
var PrefixTree = require('../js/PrefixTree');
var DeferredCaller = require('../js/DeferredCaller');

function greater (sortBy, p1, p2) {
    if (p1[sortBy] < p2[sortBy]) return -1;
    if (p1[sortBy] > p2[sortBy]) return 1;
    return 0;
}
function less(sortBy, p1, p2) {
    if (p1[sortBy] < p2[sortBy]) return 1;
    if (p1[sortBy] > p2[sortBy]) return -1;
    return 0;
}

var ProductList = React.createClass({
    getDefaultProps: function() {
        return {
            products: []
        };
    },
    newProduct: function(){
        var product = this.refs.newProduct.getProduct();
        //product._id = "";
        product.reactId = Math.random();
        this.props.products.push(product);

        this.reorder();
        this.updateProducts();

        this.prefixTree.addString(product.description, this.props.products[this.props.products.length-1]);
        this.refs.newProduct.clear();
        //socket.emit('newProduct', product);
    },
    changeHandle: function(product){
        //socket.emit('fixProduct', product);
    },
    addHandle: function(i){
        var product = this.props.products[i];
        PubSub.publish('newDishProduct', {
                description: product.description,
                proteins: product.proteins,
                triglyceride: product.triglyceride,
                carbohydrate: product.carbohydrate,
                calorie: product.calorie,
                mass: product.mass,
                details: product.details
            });
        //socket.emit('newDishProduct', id);
    },
    removeHandle: function(i){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + this.props.products[i].description + " ?",
            this.removeProduct.bind(this, i)
        );
    },
    removeProduct: function(i){
        var originsProducts = this.props.products;

        var product = originsProducts[i];

        this.prefixTree.removeString(product.description, product);
        originsProducts.splice(i, 1);
        this.updateProducts();
        //socket.emit('removeProduct', product._id);

    },
    editHandle: function(i){
        this.refs[i].makeEnabled();
    },
    endEditHandle: function(i){
        this.refs[i].makeDisabled();
    },
    componentDidMount: function() {
        this.deferredCaller = new DeferredCaller(500);
        this.prefixTree = new PrefixTree.Node();
        this.sortingFun = greater.bind(null, 'description');


        socket.emit('list');

        socket.on('list', function(list) {
            console.log("Got products from server");
            this.props.products = list.map(function(p){
                p.reactId = Math.random();
                return p;
            });
            this.reorder();
            this.buildPrefixTree();
            this.updateProducts();
        }.bind(this));
    },
    changeSorting: function(sortBy, sortOrder){
        this.sortingFun = (sortOrder === 'greater' ? greater : less).bind(null, sortBy);
        this.reorder();
        this.updateProducts();
    },
    reorder: function(){
        this.props.products = this.props.products.sort(this.sortingFun);
    },
    searchHandle: function(str){
        this.props.searchStr = str;
        this.deferredCaller.tryToCall(this.updateProducts.bind(this));
    },
    updateProducts: function(){

        var choosenProducts = this.props.searchStr ? this.prefixTree.getLinksByString(this.props.searchStr) : this.props.products;
        this.props.products.map(function(p){
            p.hidden = true;
        });
        choosenProducts.map(function(p){
            p.hidden = false;
        });

        this.setState();
        //return choosedProducts.sort(this.props.compareFunction);
    },
    buildPrefixTree: function(){
        console.time("buildPrefixTree");
        this.props.products.map(function(product){
            this.prefixTree.addString(product.description, product);
        }.bind(this));
        console.timeEnd("buildPrefixTree");
    },
    getValue: function(cb){
        return this.props.products
    },
    render: function() {
        var products = this.props.products.map(function (product, i) {
            var css = 'product';
            if(product.hidden)
                css += ' hidden ';
            return (

                <div className={css} key =             {product.reactId}>

                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.addHandle.bind(this, i)}></input>
                    <div className="btn-group btn-group-xs">
                        <a className="btn btn-block btn-default  dropdown-toggle" data-toggle="dropdown">
                            <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                            <li>
                                <a className="btn btn-xs edit" data-toggle="dropdown dropdown2" onClick={this.editHandle.bind(this, i)}>
                                    <i className="icon-pencil">Править</i>
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-xs btn-danger remove" data-toggle="dropdown" onClick={this.removeHandle.bind(this, i)}>
                                    <i className="icon-trash">Удалить</i>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className='inline-block'>
                        <Product
                                hide=             {{details: true, mass: true}}
                                enabled =         {false}
                                ref =             {i}
                                changeHandle=     {this.changeHandle}
                                product={product}>
                        </Product>
                    </div>
                </div>
            );
        }.bind(this));
        return (
            <div className={this.props.className}>
                <Sorting ref='sortBar' searchHandle={this.searchHandle} changeHandle={this.changeSorting}/>
                <div className='product newProduct'>
                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.newProduct}></input>
                    <div className='inline-block'>
                        <Product
                            enabled= {{all:true}}
                            ref='newProduct'
                            hide=             {{details: true, mass: true}}/>
                    </div>
                </div>
                <p className='product inline-block'>Список продуктов</p>
                <div className='productList'>
                    {products}
                </div>
            </div>
        );
    }
});
//.render(
//    <ProductList />,
//    document.getElementById('productList')
//);
module.exports = ProductList;