/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ProductList = React.createClass({
    getInitialState: function() {
        return {
            id: null,
            products: this.props.originProducts
        }
    },
    getDefaultProps: function() {
        return {
            compareFunction: Sorting.defaultCompare,
            originProducts: [],
            searchStr: ''
        };
    },
    newProduct: function(){
        var newProduct = this.refs.newProduct.getProduct();
        console.log('Added', newProduct);
        socket.emit('newProduct', newProduct);
    },
    changeHandle: function(product){

        socket.emit('fixProduct', product);
    },
    addHandle: function(id){
        socket.emit('newDishProduct', id);
    },
    removeHandle: function(id){
        var products = this.props.originProducts;
        for(var i = products.length; i--; )
        {
            var product = products[i];
            if(id === products[i]._id){
                this.prefixTree.removeString(product.description, product);
                products.splice(i, 1);
                this.setState({products: this.getSearchResults()});
                socket.emit('removeProduct', id);
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
    getSearchResults: function(){
        var choosedProducts = this.prefixTree.getLinksByString(this.props.searchStr);
        return choosedProducts.sort(this.props.compareFunction);
    },
    buildPrefix: function(){
        console.time("buildPrefixTree");
        this.props.originProducts.map(function(product){
            this.prefixTree.addString(product.description.toLowerCase(), product);
        }.bind(this));
        console.timeEnd("buildPrefixTree");
    },
    componentDidMount: function() {
        socket.on('list', function(data){
            this.props.originProducts = data;
            this.buildPrefix();
            this.setState({products: this.getSearchResults()})
        }.bind(this));

        socket.on('newProduct', function(newProduct){
            var products = this.props.originProducts;
            products.push(newProduct);

            this.props.originProducts.push(newProduct);
            this.prefixTree.addString(newProduct.description.toLowerCase(), newProduct);

            this.setState({products: this.getSearchResults()})
        }.bind(this));

        socket.emit('list');

        this.prefixTree = new PrefixTree.Node();

    },
    changeSorting: function(sortingFunction){
        this.props.compareFunction = this.refs.sortBar.getSortFunction();
        this.setState({
            products: this.getSearchResults()
        });
    },
    searchHandle: function(str){
        this.props.searchStr = str.toLowerCase();
        this.setState({
            products: this.getSearchResults()
        });
    },
    render: function() {
        var products = this.state.products.map(function (product) {
            return (
                <div className='product'>

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
                                <a className="btn btn-xs btn-danger remove" data-toggle="dropdown" onClick={this.removeHandle.bind(this, product._id)}>
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
                                key =             {product._id}
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
            <div className="productList">
                <Sorting ref='sortBar' searchHandle={this.searchHandle} changeHandle={this.changeSorting}/>
                <div className='product newProduct'>
                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.newProduct}></input>
                    <div className='inline-block'>
                        <Product
                            enabled={true}
                            ref='newProduct'
                            hide=             {{details: true, mass: true}}/>
                    </div>
                </div>
                {products}
            </div>
        );
    }
});