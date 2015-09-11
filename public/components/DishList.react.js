/**
 * Created by vasiliy.lomanov on 23.07.2015.
 */

var utils = require('../utils');
var socket = require('../socket');
var Product = require('./Product.react.js');
var Daily = require('./Daily.react.js');
var Dish = require('./Dish.react.js');
var Calculator = require('./Calculator.react.js');
var DishListHead = require('./DishListHead.react.js');

var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;

var DishList = React.createClass({
    getDefaultProps: function() {
        return {
            dishes: []
        };
    },
    changeHandle: function(i, dish){
        this.props.dishes[i].contain = [dish.full, dish.portion];
        this.props.dishes[i].description = dish.description;
        //socket.emit('fixDish', dish);
    },
    removeHandle: function(i){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + this.props.dishes[i].description + " ?",
            this.removeDish.bind(this, i)
        );
    },
    removeDish: function(i){
        var dishes = this.props.dishes;

        var dish = dishes[i];

        dishes.splice(i, 1);
        this.setState();
        //socket.emit('removeDish', dish._id);

    },
    componentDidMount: function() {
        socket.emit('getCurrentDishes');

        socket.on('getCurrentDishes', function(list) {
            this.props.dishes = list;
            this.setState();
        }.bind(this));

        PubSub.subscribe( 'newDish', function(msg, dish){
            this.props.dishes.push(dish);
            this.forceUpdate();
        }.bind(this));
    },
    getValue: function(){
        return this.props.dishes;
    },
    publishNweDailyItem: function(dayPartName, dish){
        var portion = dish.contain[1];
        portion.description = dish.description + ' ' + portion.mass;
        PubSub.publish('newDailyProduct', {
            dayPartName: dayPartName,
            portion: portion
        });
    },
    render: function() {

        var dishes = this.props.dishes.map(function (dish, i) {
            var css = 'product';

            var menuItems = Daily.dayPartNames.map(function(dayPartName){
                return (
                    <MenuItem onSelect={this.publishNweDailyItem.bind(null, dayPartName, dish)}>{'Добавить в ' + dayPartName}</MenuItem>
                );
            }, this);

            menuItems.push((
                <MenuItem onSelect={this.publishNweDailyItem.bind(null, 'additional', dish)}>{'Добавить в дополнительное'}</MenuItem>
            ));

            return (
                <div className={css} key =             {dish._id}>
                    <ButtonGroup >
                        <Button bsSize='xsmall' bsStyle='danger' className='item remove' onClick={this.removeHandle.bind(this, i)}>-</Button>
                        <DropdownButton noCaret bsSize='xsmall' bsStyle='primary' title='+'>
                            {menuItems}
                        </DropdownButton>
                    </ButtonGroup>
                    <div className='inline-block'>
                        <Dish
                            hide=             {{details: true, mass: true}}
                            ref =             {dish._id}
                            _id =              {dish._id}
                            description =     {dish.description}
                            full =            {dish.contain[0]}
                            portion =         {dish.contain[1]}
                            changeHandle =    {this.changeHandle.bind(this, i)}>
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