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

        this.prefixTree.addString(product.description, this.props.products[this.props.products.length-1]);

        this.reorder();
        this.refs.newProduct.clear();
        this.forceUpdate();
    },
    changeHandle: function(product){

    },
    addHandle: function(product){
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
    removeHandle: function(product){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + product.description + " ?",
            this.removeProduct.bind(this, product)
        );
    },
    removeProduct: function(product){
        var products = this.props.products;

        for(var i = 0; i < products.length; i++){
            var cP = products[i];

            if(cP.reactId === product.react.Id){
                this.prefixTree.removeString(cP.description, cP);
                products.splice(i, 1);
                this.forceUpdate();
                return;
            }
        }

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
    },
    componentWillReceiveProps: function(nextProps){

        nextProps.products = nextProps.products.sort(this.sortingFun);
        this.buildPrefixTree(nextProps.products);
    },
    changeSorting: function(sortBy, sortOrder){
        this.sortingFun = (sortOrder === 'greater' ? greater : less).bind(null, sortBy);
        this.reorder();
        this.forceUpdate();
    },
    reorder: function(){
        this.props.products = this.props.products.sort(this.sortingFun);
    },
    searchHandle: function(str){
        this.props.searchStr = str;
        this.deferredCaller.tryToCall(this.forceUpdate.bind(this));
    },
    choosenProducts: function(){

        var choosenProducts = this.props.searchStr ? this.prefixTree.getLinksByString(this.props.searchStr) : this.props.products;
        this.props.products.map(function(p){
            p.hidden = true;
        });
        choosenProducts.map(function(p){
            p.hidden = false;
        });

        return choosenProducts;
        //return choosedProducts.sort(this.props.compareFunction);
    },
    buildPrefixTree: function(proucts){
        console.time("buildPrefixTree");
        proucts.map(function(product){
            this.prefixTree.addString(product.description, product);
        }.bind(this));
        console.timeEnd("buildPrefixTree");
    },
    getValue: function(cb){
        return this.props.products
    },
    render: function() {
        var products = this.choosenProducts().map(function (product, i) {
            var css = 'product';
            if(product.hidden)
                css += ' hidden ';
            return (

                <div className={css} key =             {product.reactId}>

                    <ButtonGroup >
                        <Button bsSize='xsmall' bsStyle='default' className='item' onClick={this.addHandle.bind(this, product)}>+</Button>
                        <DropdownButton title="" bsSize='xsmall' bsStyle='default'>
                            <MenuItem eventKey="1" onSelect={this.editHandle.bind(this, i)}>{'Править'}</MenuItem>
                            <MenuItem eventKey="2" bsStyle='danger' onSelect={this.removeHandle.bind(this, product)}>{'Удалить'}</MenuItem>
                        </DropdownButton>
                    </ButtonGroup>
                    <Product
                            hide=             {{details: true, mass: true}}
                            enabled =         {false}
                            css =             {css}
                            ref =             {i}
                            changeHandle=     {this.changeHandle}
                            product={product}>
                    </Product>
                </div>
            );
        }.bind(this));

        var header = (
            <div className='newProduct input-group input-group-sm'>
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