/**
 * Created by vasiliy.lomanov on 29.07.2015.
 */


var App = React.createClass({
    render: function() {
        return (
            <div >
                <ReactDishList className="dishList myTable"/>
                <div className='container-fluid'>
                    <DishProductList className='currentDishProducts myTable'/>
                    <ReactProductList className='myTable inline-block'/>
                </div>
            </div>
        );
    }
});

React.render(
    <App />,
    document.getElementById('app')
);