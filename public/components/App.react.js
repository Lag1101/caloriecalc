/**
 * Created by vasiliy.lomanov on 29.07.2015.
 */


var utils = require('../utils');
var DishList = require('./DishList.react.js');
var ProductList = require('./ProductList.react.js');
var DishProductList = require('./DishProductList.react.js');
var Daily = require('./Daily.react.js');

var App = React.createClass({
    getInitialState: function(){
        return {
            list: [],
            daily: {
                "" : {
                    additional: [],
                    main: []
                }
            },
            date: "",
            currentDishProducts: [],
            currentDishes: []
        }
    },
    save: function(){

        $(this.refs.hardSaveButton.getDOMNode()).button('loading');

        var bundle = {
            productList:        this.refs.productList.getValue(),
            dishProductList:    this.refs.dishProductList.getValue(),
            dishList:           this.refs.dishList.getValue(),
            daily:              this.refs.daily.getValue()
        };
        this.socket.emit('save', bundle);
    },
    componentDidMount: function(){

        this.socket = require('../socket');
        this.socket.emit('bundle');
        this.socket
            .on('save', function(){
                $(this.refs.hardSaveButton.getDOMNode()).button('reset');
            }.bind(this))
            .on('bundle', function(bundle){
                var s = {};
                s.productList = bundle.list;
                s.date = bundle.date;
                s.daily = {};
                s.daily[bundle.date] = bundle.daily;
                s.dishProductList = bundle.currentDishProducts;
                s.currentDishes = bundle.currentDishes;
                s.norm = {
                    min : {
                        proteins: bundle.norm.proteins.min,
                            triglyceride: bundle.norm.triglyceride.min,
                            carbohydrate: bundle.norm.carbohydrate.min,
                            calorie: bundle.norm.calorie.min
                    },
                    max : {
                        proteins: bundle.norm.proteins.max,
                            triglyceride: bundle.norm.triglyceride.max,
                            carbohydrate: bundle.norm.carbohydrate.max,
                            calorie: bundle.norm.calorie.max
                    }
                };
                this.setState(s);
            }.bind(this));
    },
    render: function() {
        return (
            <div >
                <div className='container-fluid'>
                    <Daily className="myTable daily"
                        ref="daily"
                        norm = {this.state.norm}
                        date =  {this.state.date}
                        daily = {this.state.daily}/>
                </div>
                <DishList className="dishList myTable"
                    ref='dishList'
                    dishes = {this.state.currentDishes}/>
                <div className='container-fluid'>
                    <DishProductList className='currentDishProducts myTable'
                        ref="dishProductList"
                        dishProducts = {this.state.dishProductList} />
                    <ProductList className='myTable inline-block'
                        ref="productList"
                        products = {this.state.productList}/>
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