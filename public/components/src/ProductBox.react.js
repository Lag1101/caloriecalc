/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ProductBox = React.createClass({
    getInitialState: function() {
        return {
            products: []
        }
    },
    componentDidMount: function() {

    },
    changeHandle: function(){
        console.log('product changed', this.getProduct());
    },
    render: function() {
        return (
            <div>
                <div className="myTable" >
                    <DishProductList />
                </div>
                <div className="myTable" >
                    <ProductList />
                </div>
            </div>
        );
    }
});



React.render(
    <ProductBox />,
    document.getElementById('content')
);