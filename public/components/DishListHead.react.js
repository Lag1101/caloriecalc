/**
 * Created by vasiliy.lomanov on 11.08.2015.
 */

var Dish = require('./Dish.react.js');

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
    render: function() {
        return (
            <div className={this.props.className}>
                <div className='dishList'>
                    <p className='product inline-block'>Новое блюдо</p>
                    <div className='product'>
                        <button className='save item btn btn-xs btn-default'
                                onClick={this.newDishHandle}>
                            <i className='glyphicon glyphicon-floppy-disk'/>
                        </button>
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