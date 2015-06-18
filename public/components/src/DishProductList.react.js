/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var DishProductList = React.createClass({
    getInitialState: function() {
        return {
            id: null,
            products: []
        }
    },
    newProduct: function(){
        var newProduct = this.refs.newProduct.getProduct();
        console.log('Added', newProduct);
        socket.emit('newProduct', newProduct);
    },
    changeHandle: function(product){

        socket.emit('fixDishProduct', product);
    },
    removeHandle: function(id){
        var products = this.state.products;
        for(var i = products.length; i--; )
        {
            if(id === products[i]._id){
                products.splice(i, 1);
                this.setState({products: products});
                socket.emit('removeDishProduct', id);
                return;
            }
        }
    },
    componentDidMount: function() {
        socket.emit('getCurrentDishProducts');
        socket.on('getCurrentDishProducts', function(data){
            this.setState({products: data})
        }.bind(this));

        socket.on('newDishProduct', function(newProduct){
            var products = this.state.products;
            products.push(newProduct);
            this.setState({products: products})
        }.bind(this));
    },
    calcResultDish: function(){
        var res = {
            proteins: 0.0,
            triglyceride: 0.0,
            carbohydrate: 0.0,
            calorie: 0.0
        };


    },
    render: function() {
        var products = this.state.products.map(function (product) {
            return (
                <div className='product'>
                    <input type='button' className='btn btn-xs btn-danger inline-block item' value='-' onClick={this.removeHandle.bind(this, product._id)}></input>
                    <div className='inline-block'>
                        <Product
                                hide=             {{details: true}}
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
                </div>
            );
        }.bind(this));
        return (
            <div className="dishList">
                <Dish/>
                {products}
            </div>
        );
    }
});