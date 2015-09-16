/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var utils = require('../utils');
var Product = require('./Product.react.js');
var Sorting = require('./Sorting.react.js');
var PrefixTree = require('../js/PrefixTree');
var DeferredCaller = require('../js/DeferredCaller');

var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var Panel = ReactBootstrap.Panel;

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
    },
    changeHandle: function(product){

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

        this.props.products.forEach(function(p){
            p.reactId = Math.random();
        });
        this.reorder();
        this.buildPrefixTree();
        this.updateProducts();
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

                    <ButtonGroup >
                        <Button bsSize='xsmall' bsStyle='default' className='item' onClick={this.addHandle.bind(this, i)}>+</Button>
                        <DropdownButton title="" bsSize='xsmall' bsStyle='default'>
                            <MenuItem eventKey="1" onSelect={this.editHandle.bind(this, i)}>{'Править'}</MenuItem>
                            <MenuItem eventKey="2" bsStyle='danger' onSelect={this.removeHandle.bind(this, i)}>{'Удалить'}</MenuItem>
                        </DropdownButton>
                    </ButtonGroup>
                    <Product
                            hide=             {{details: true, mass: true}}
                            enabled =         {false}
                            ref =             {i}
                            changeHandle=     {this.changeHandle}
                            product={product}>
                    </Product>
                </div>
            );
        }.bind(this));

        var header = (
            <div className='newProduct'>
                <p>Список продуктов</p>
                <Button bsSize='xsmall' bsStyle='default' className='item' onClick={this.newProduct}>+</Button>
                <Product
                    enabled= {{all:true}}
                    ref='newProduct'
                    hide=             {{details: true, mass: true}}/>
            </div>
        );

        return (
            <Panel bsStyle="primary" header={header} className="inline-block products myTable">
                <Sorting ref='sortBar' searchHandle={this.searchHandle} changeHandle={this.changeSorting}/>
                <div className="productList">
                    {products}
                </div>
            </Panel>
        );
    }
});
//.render(
//    <ProductList />,
//    document.getElementById('productList')
//);
module.exports = ProductList;