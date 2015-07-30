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
            originDishes: [],
            full: {
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0,
                mass: 100
            },
            portion: {
                proteins: 0.0,
                triglyceride: 0.0,
                carbohydrate: 0.0,
                calorie: 0.0,
                mass: 100
            }
        };
    },
    defaultDishChanged: function(dish){
        this.props.full = dish.full;
        this.props.portion = dish.portion;
    },
    setSum: function(sum){
        this.props.full.proteins = sum.proteins;
        this.props.full.triglyceride = sum.triglyceride;
        this.props.full.carbohydrate = sum.carbohydrate;
        this.props.full.calorie = sum.calorie;


        this.setState();
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
            <div className={this.props.className}>
                <div className='dishList'>
                    <div className='product'>
                        <button className='save item btn btn-xs btn-default'
                                onClick={this.newDishHandle}>
                            <i className='glyphicon glyphicon-floppy-disk'/>
                        </button>
                        <ReactDish className='inline-block'
                            //hideDescription = {true}
                                   ref = 'dish'
                                   description = {""}
                                   full={this.props.full}
                                   portion={this.props.portion}
                                   changeHandle={this.defaultDishChanged}/>
                    </div>
                    {dishes}
                </div>
            </div>
        );
    }
});

//React.render(
//    <ReactDishList />,
//    document.getElementById('dishList')
//);