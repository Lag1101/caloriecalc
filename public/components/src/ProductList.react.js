/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ProductList = React.createClass({
    getInitialState: function() {
        return {
            id: null
        }
    },
    changeHandle: function(product){
        console.log('product changed', product);

        socket.emit('fixProduct', product);
    },
    render: function() {
        var products = this.props.data.map(function (product) {
            return (
                <Product
                        ref=''
                        changeHandle={this.changeHandle}
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
            );
        }.bind(this));
        return (
            <div className="productList">
                {products}
            </div>
        );
    }
});