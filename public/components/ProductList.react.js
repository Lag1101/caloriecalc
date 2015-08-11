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
    getInitialState: function() {
        return {
            id: null,
            products: this.props.originProducts
        }
    },
    getDefaultProps: function() {
        return {
            originProducts: []
        };
    },
    newProduct: function(){
        var newProduct = this.refs.newProduct.getProduct();
        socket.emit('newProduct', newProduct);
    },
    changeHandle: function(product){
        socket.emit('fixProduct', product);
    },
    addHandle: function(id){
        socket.emit('newDishProduct', id);
    },
    removeHandle: function(productToRemove){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + productToRemove.description + " ?",
            this.removeProduct.bind(this, productToRemove)
        );
    },
    removeProduct(productToRemove){
        var originsProducts = this.props.originProducts;
        for(var i = originsProducts.length; i--; )
        {
            var product = originsProducts[i];
            if(productToRemove._id === product._id){
                this.prefixTree.removeString(product.description, product);
                originsProducts.splice(i, 1);
                this.updateProducts();
                socket.emit('removeProduct', productToRemove._id);
                return;
            }
        }
    },
    editHandle: function(id){
        this.refs[id].makeEnabled();
    },
    endEditHandle: function(id){
        this.refs[id].makeDisabled();
    },
    componentDidMount: function() {
        this.deferredCaller = new DeferredCaller(100);
        this.prefixTree = new PrefixTree.Node();
        this.sortingFun = greater.bind(null, 'description');

        socket.emit('list');
        socket.on('list', function(list) {
            this.props.originProducts = list;
            this.reorder();
            this.buildPrefixTree();
            this.updateProducts();
        }.bind(this));
        socket.on('newProduct', function(product) {
            this.props.originProducts.push(product);
            this.prefixTree.addString(product.description, product);
            this.reorder();
            this.updateProducts();
        }.bind(this));
    },
    changeSorting: function(sortBy, sortOrder){
        this.sortingFun = (sortOrder === 'greater' ? greater : less).bind(null, sortBy);
        this.updateProducts();
    },
    reorder: function(){
        this.props.originProducts = this.props.originProducts.sort(this.sortingFun);
    },
    searchHandle: function(str){
        this.props.searchStr = str;
        this.updateProducts();
    },
    updateProducts: function(){
        this.deferredCaller.tryToCall(function(){
            var choosenProducts = this.props.searchStr ? this.prefixTree.getLinksByString(this.props.searchStr) : this.props.originProducts;
            this.props.originProducts.map(function(p){
                p.hidden = true;
            });
            choosenProducts.map(function(p){
                p.hidden = false;
            });

            this.setState({products: this.props.originProducts});
        }.bind(this));
        //return choosedProducts.sort(this.props.compareFunction);
    },
    buildPrefixTree: function(){
        console.time("buildPrefixTree");
        this.props.originProducts.map(function(product){
            this.prefixTree.addString(product.description, product);
        }.bind(this));
        console.timeEnd("buildPrefixTree");
    },
    render: function() {
        var products = this.state.products.map(function (product) {
            var css = 'product';
            if(product.hidden)
                css += ' hidden ';
            return (

                <div className={css} key =             {product._id}>

                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.addHandle.bind(this, product._id)}></input>
                    <div className="btn-group btn-group-xs">
                        <a className="btn btn-block btn-default  dropdown-toggle" data-toggle="dropdown">
                            <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                            <li>
                                <a className="btn btn-xs edit" data-toggle="dropdown dropdown2" onClick={this.editHandle.bind(this, product._id)}>
                                    <i className="icon-pencil">Править</i>
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-xs btn-danger remove" data-toggle="dropdown" onClick={this.removeHandle.bind(this, product)}>
                                    <i className="icon-trash">Удалить</i>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className='inline-block'>
                        <Product
                                hide=             {{details: true, mass: true}}
                                enabled =         {false}
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