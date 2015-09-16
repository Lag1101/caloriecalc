/**
 * Created by vasiliy.lomanov on 29.07.2015.
 */


var utils = require('../utils');
var DishList = require('./DishList.react.js');
var ProductList = require('./ProductList.react.js');
var DishProductList = require('./DishProductList.react.js');
var Daily = require('./Daily.react.js');

var Col = ReactBootstrap.Col;
var Row = ReactBootstrap.Row;

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
                        proteins:       parseFloat(bundle.norm.proteins.min),
                        triglyceride:   parseFloat(bundle.norm.triglyceride.min),
                        carbohydrate:   parseFloat(bundle.norm.carbohydrate.min),
                        calorie:        parseFloat(bundle.norm.calorie.min)
                    },
                    max : {
                        proteins:       parseFloat(bundle.norm.proteins.max),
                        triglyceride:   parseFloat(bundle.norm.triglyceride.max),
                        carbohydrate:   parseFloat(bundle.norm.carbohydrate.max),
                        calorie:        parseFloat(bundle.norm.calorie.max)
                    }
                };
                this.setState(s);
            }.bind(this));
    },
    render: function() {
        return (
            <div >
                <Row>
                    <Col xs={12} md={6}>
                        <Daily
                            ref="daily"
                            norm = {this.state.norm}
                            date =  {this.state.date}
                            daily = {this.state.daily}/>
                    </Col>
                    <Col xs={12} md={6}>
                        <DishList
                            ref='dishList'
                            dishes = {this.state.currentDishes}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6}>
                        <DishProductList
                            ref="dishProductList"
                            dishProducts = {this.state.dishProductList} />
                    </Col>
                    <Col xs={12} md={6}>
                        <ProductList
                            ref="productList"
                            products = {this.state.productList}/>
                    </Col>
                </Row>
                <button ref="hardSaveButton" className="btn btn-primary hardSaveButton" onClick={this.save} data-loading-text="Сохранение ...">Сохранить</button>
            </div>
        );
    }
});

React.render(
    <App />,
    document.getElementById('app')
);