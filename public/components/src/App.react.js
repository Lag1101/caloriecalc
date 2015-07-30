/**
 * Created by vasiliy.lomanov on 29.07.2015.
 */


var App = React.createClass({
    sumChanged: function(sum){
        this.refs.dishList.setSum(sum);
    },
    render: function() {
        return (
            <div >
                <ReactDishList ref='dishList' className="dishList myTable"/>
                <div className='container-fluid'>
                    <DishProductList
                        className='currentDishProducts myTable'
                        sumChanged={this.sumChanged}
                        />
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