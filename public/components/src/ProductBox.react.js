/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ProductBox = React.createClass({
    getInitialState: function() {
        return {
            data: []
        }
    },
    componentDidMount: function() {
        socket.on('list', function(data){
            this.setState({data: data})
        }.bind(this));
        socket.emit('list');
    },
    changeHandle: function(){
        console.log('product changed', this.getProduct());
    },
    render: function() {
        return (
            <div className="myTable" >
                <ProductList data={this.state.data} />
            </div>
        );
    }
});



React.render(
    <ProductBox data />,
    document.getElementById('content')
);