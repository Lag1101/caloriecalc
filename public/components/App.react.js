/**
 * Created by vasiliy.lomanov on 29.07.2015.
 */


var socket = require('../socket');
var utils = require('../utils');
var DishList = require('./DishList.react.js');
var ProductList = require('./ProductList.react.js');
var DishProductList = require('./DishProductList.react.js');
var Daily = require('./Daily.react.js');


var App = React.createClass({
    sumChanged: function(sum){
        this.refs.dishList.setSum(sum);
    },
    render: function() {
        return (
            <div >
                <div className='container-fluid'>
                    <Daily className="myTable daily"/>
                </div>
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

(function () {
    var b = $('.hardSaveButton');
    socket.on('save', function(){
        b.button('reset');
    });
    b.click(function () {
        b.button('loading');
        socket.emit('save');
    });
})();