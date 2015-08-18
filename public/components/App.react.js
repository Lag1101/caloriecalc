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
    save: function(){

        $(this.refs.hardSaveButton.getDOMNode()).button('loading');

        var bundle = {

            productList:        this.refs.productList.getValue(),
            dishProductList:    this.refs.dishProductList.getValue(),
            dishList:           this.refs.dishList.getValue(),
            daily:              this.refs.daily.getValue()
        };
        socket.emit('save', bundle);
    },
    componentDidMount: function(){
        socket.on('save', function(){
            $(this.refs.hardSaveButton.getDOMNode()).button('reset');
        }.bind(this));
    },
    render: function() {
        return (
            <div >
                <div className='container-fluid'>
                    <Daily ref="daily" className="myTable daily"/>
                </div>
                <DishList ref='dishList' className="dishList myTable"/>
                <div className='container-fluid'>
                    <DishProductList ref="dishProductList" className='currentDishProducts myTable' />
                    <ProductList ref="productList" className='myTable inline-block'/>
                </div>
                <button ref="hardSaveButton" className="btn btn-primary hardSaveButton" onClick={this.save} data-loading-text="Сохранение ...">Сохранить</button>
            </div>
        );
    }
});

React.render(
    <App />,
    document.getElementById('app')
);