/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ProductList = React.createClass({
    getInitialState: function() {
        return {
            id: null,
            products: []
        }
    },
    getDefaultProps: function() {
        return {
            compareFunction: Sorting.defaultCompare
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
        var products = this.state.products;
        for(var i = products.length; i--; )
        {
            if(id === products[i]._id){
                products.splice(i, 1);
                this.setState({products: products.sort(this.props.compareFunction)});
                socket.emit('removeProduct', id);
                return;
            }
        }
    },
    componentDidMount: function() {
        socket.on('list', function(data){
            this.setState({products: data.sort(this.props.compareFunction)})
        }.bind(this));
        socket.on('newProduct', function(newProduct){
            var products = this.state.products;
            products.push(newProduct);
            this.setState({products: products.sort(this.props.compareFunction)})
        }.bind(this));
        socket.emit('list');
    },
    changeSorting: function(sortingFunction){
        this.props.compareFunction = this.refs.sortBar.getSortFunction();
        this.setState({
            sortingFunction: sortingFunction,
            products: this.state.products.sort(this.props.compareFunction)
        });
    },
    render: function() {
        var products = this.state.products.map(function (product) {
            return (
                <div className='product'>
                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.addHandle.bind(this, product._id)}></input>
                    <div className='inline-block'>
                        <Product
                                enabled =         {true}
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
                    <input type='button' className='btn btn-xs btn-danger inline-block item' value='-' onClick={this.removeHandle.bind(this, product._id)}></input>
                </div>
            );
        }.bind(this));
        return (
            <div className="productList">
                <Sorting ref='sortBar' changeHandle={this.changeSorting}/>
                <div className='product newProduct'>
                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.newProduct}></input>
                    <div className='inline-block'>
                        <Product enabled={true} ref='newProduct'/>
                    </div>
                </div>
                {products}
            </div>
        );
    }
});