/**
 * Created by vasiliy.lomanov on 23.07.2015.
 */

var utils = require('../utils');
var socket = require('../socket');
var Product = require('./Product.react.js');
var Dish = require('./Dish.react.js');
var Calculator = require('./Calculator.react.js');
var DishListHead = require('./DishListHead.react.js');
var React = require('react');

var DishList = React.createClass({
    getInitialState: function() {
        return {
            id: null,
            dishes: this.props.originDishes
        }
    },
    getDefaultProps: function() {
        return {
            originDishes: []
        };
    },
    changeHandle: function(dish){
        socket.emit('fixDish', dish);
    },
    removeHandle: function(i){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + this.props.originDishes[i].description + " ?",
            this.removeDish.bind(this, i)
        );
    },
    removeDish: function(i){
        var originDishes = this.props.originDishes;

        var dish = originDishes[i];

        originDishes.splice(i, 1);
        this.setState({dishes: originDishes});
        socket.emit('removeDish', dish._id);

    },
    componentDidMount: function() {
        socket.emit('getCurrentDishes');

        socket.on('getCurrentDishes', function(list) {
            this.props.originDishes = list;
            this.setState({dishes: this.props.originDishes});
        }.bind(this));
        socket.on('newDish', function(dish) {
            this.props.originDishes.push(dish);
            this.setState({dishes: this.props.originDishes});
        }.bind(this));
    },
    render: function() {
        var dishes = this.state.dishes.map(function (dish, i) {
            var css = 'product';

            return (

                <div className={css} key =             {dish._id}>
                    <input type='button' className='btn btn-xs btn-danger inline-block item remove' value='-' onClick={this.removeHandle.bind(this, i)}></input>
                    <div className='inline-block'>
                        <Dish
                            hide=             {{details: true, mass: true}}
                            ref =             {dish._id}
                            _id =              {dish._id}
                            description =     {dish.description}
                            full =            {dish.contain[0]}
                            portion =         {dish.contain[1]}
                            changeHandle =    {this.changeHandle}>
                        </Dish>
                    </div>
                </div>
            );
        }.bind(this));
        return (
            <div className={this.props.className}>
                <div className='dishList'>
                    <DishListHead/>
                    <p className='product inline-block'>Список блюд</p>
                    {dishes}
                    <Calculator className="product"/>
                </div>
            </div>
        );
    }
});

//.render(
//    <DishList />,
//    document.getElementById('dishList')
//);
module.exports = DishList;