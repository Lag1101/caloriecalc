/**
 * Created by vasiliy.lomanov on 29.07.2015.
 */

var DishList = require('./DishList.react');
var ProductList = require('./ProductList.react');
var DishProductList = require('./DishProductList.react');


var App = React.createClass({
    sumChanged: function(sum){
        this.refs.dishList.setSum(sum);
    },
    render: function() {
        return (
            <div >
                <DishList ref='dishList' className="dishList myTable"/>
                <div className='container-fluid'>
                    <DishProductList
                        className='currentDishProducts myTable'
                        sumChanged={this.sumChanged}
                        />
                    <ProductList className='myTable inline-block'/>
                </div>
            </div>
        );
    }
});

React.render(
    <App />,
    document.getElementById('app')
);