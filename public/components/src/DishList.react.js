/**
 * Created by vasiliy.lomanov on 23.07.2015.
 */

var ReactDishList = React.createClass({
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
    removeHandle: function(dishToRemove){
        utils.confirmDialog(
            "Вы уверены, что хотите удалить " + dishToRemove.description + " ?",
            this.removeDish.bind(this, dishToRemove)
        );
    },
    removeDish(dishToRemove){
        var originDishes = this.props.originDishes;
        for(var i = originDishes.length; i--; )
        {
            var dish = originDishes[i];
            if(dishToRemove._id === dish._id){
                originDishes.splice(i, 1);
                this.setState({dishes: this.props.originDishes});
                socket.emit('removeDish', dishToRemove._id);
                return;
            }
        }
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
        var dishes = this.state.dishes.map(function (dish) {
            var css = 'product';

            return (

                <div className={css} key =             {dish._id}>
                    <input type='button' className='btn btn-xs btn-danger inline-block item remove' value='-' onClick={this.removeHandle.bind(this, dish)}></input>
                    <div className='inline-block'>
                        <ReactDish
                            hide=             {{details: true, mass: true}}
                            ref =             {dish._id}
                            id =              {dish._id}
                            description =     {dish.description}
                            full =            {dish.contain[0]}
                            portion =         {dish.contain[1]}
                            changeHandle =    {this.changeHandle.bind(this)}>
                        </ReactDish>
                    </div>
                </div>
            );
        }.bind(this));
        return (
            <div>
                <div className='dishList'>
                    {dishes}
                </div>
            </div>
        );
    }
});

React.render(
    <ReactDishList />,
    document.getElementById('dishList')
);