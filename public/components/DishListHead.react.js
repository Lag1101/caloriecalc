/**
 * Created by vasiliy.lomanov on 11.08.2015.
 */

var Dish = require('./Dish.react.js');
var Daily = require('./Daily.react.js');

var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;

var DishListHead = React.createClass({
    getInitialState: function() {
        return {
            description: '',
            full: {
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0,
                mass: 100
            },
            portion:{
                mass: 100
            }
        }
    },
    changeHandle: function(dish){
        this.state.description = dish.description;
        this.state.full = dish.full;
        this.state.portion = dish.portion;
    },
    newDishHandle: function(){
        var newDish = this.refs.dish.getDish();
        PubSub.publish('newDish', {
            description: newDish.description,
            contain: [
                newDish.full,
                newDish.portion
            ]
        });
    },
    componentDidMount: function() {
        PubSub.subscribe( 'ProductDishesChanged', function(msg, newSum){
            this.setState({
                full: {
                    proteins: newSum.proteins,
                    triglyceride: newSum.triglyceride,
                    carbohydrate: newSum.carbohydrate,
                    calorie: newSum.calorie,
                    mass: this.state.full.mass
                }
            });
        }.bind(this));
    },
    publishNweDailyItem: function(dayPartName){
        var dish = this.refs.dish.getDish();
        var portion = dish.portion;

        portion.description = dish.description + ' ' + portion.mass;
        PubSub.publish('newDailyProduct', {
            dayPartName: dayPartName,
            portion: portion
        });
    },
    render: function() {
        var menuItems = Daily.dayPartNames.map(function(dayPartName){
            return (
                <MenuItem onSelect={this.publishNweDailyItem.bind(null, dayPartName)}>{'Добавить в ' + dayPartName}</MenuItem>
            );
        }, this);

        menuItems.push((
            <MenuItem onSelect={this.publishNweDailyItem.bind(null, 'additional')}>{'Добавить в дополнительное'}</MenuItem>
        ));
        return (
            <div className={this.props.className}>
                <div className='dishList'>
                    <div className='product'>
                        <ButtonGroup >
                            <Button bsSize='xsmall' bsStyle='default' className='item' onClick={this.newDishHandle}><Glyphicon glyph="floppy-disk"/></Button>
                            <DropdownButton noCaret bsSize='xsmall' bsStyle='default' title='+'>
                                {menuItems}
                            </DropdownButton>
                        </ButtonGroup>
                        <Dish className='inline-block'
                            //hideDescription = {true}
                              ref = 'dish'
                              description = {this.state.description}
                              full={this.state.full}
                              portion={this.state.portion}
                              changeHandle={this.changeHandle}/>
                    </div>
                </div>
            </div>
        );
    }
});

//.render(
//    <DishList />,
//    document.getElementById('dishList')
//);
module.exports = DishListHead;