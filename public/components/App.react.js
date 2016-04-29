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

        $.post({
            url: window.location.href + "/save",
            data: {data: bundle},
            success: function() {
                console.log("success");
                $(this.refs.hardSaveButton.getDOMNode()).button('reset');
            }.bind(this),
            fail: function(err) {
                BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_DANGER,
                        title: 'DANGER',
                        draggable: true,
                        message: err.body + "\nИзвините, мы не смогли отправить на сервер ваши изменения\nПопробуйте еще раз",
                        closable: true
                });
                $(this.refs.hardSaveButton.getDOMNode()).button('reset');
            }.bind(this)
        });
    },
    componentDidMount: function(){

        $.post( window.location.href + "/bundle", function( bundle ) {
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