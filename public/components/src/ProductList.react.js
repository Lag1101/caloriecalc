/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ProductList = React.createClass({
    getInitialState: function() {
        return {
            id: null
        }
    },
    changeHandle: function(){
        console.log('product changed', this.getProduct());
    },
    render: function() {
        var products = this.props.data.map(function (product) {
            return (
                <Product  id =              {product.id}
                          description =     {product.description}
                          proteins =        {product.proteins}
                          triglyceride =    {product.triglyceride}
                          carbohydrate =    {product.carbohydrate}
                          calorie =         {product.calorie}
                          mass =            {product.mass}
                          details =         {product.details}>
                </Product>
            );
        });
        return (
            <div className="productList">
                {products}
            </div>
        );
    }
});