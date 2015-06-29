/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var ReactProductList = React.createClass({
    getInitialState: function() {
        return {
            id: null,
            products: this.props.originProducts
        }
    },
    getDefaultProps: function() {
        return {
            originProducts: [],
            searchStr: ''
        };
    },
    newProduct: function(){
        var newProduct = this.refs.newProduct.getProduct();
        this.worker.postMessage({cmd:'newProduct', newProduct: newProduct});
    },
    changeHandle: function(product){

        socket.emit('fixProduct', product);
    },
    addHandle: function(id){
        socket.emit('newDishProduct', id);
    },
    removeHandle: function(id){
        this.worker.postMessage({cmd:'removeProduct', id: id});
    },
    editHandle: function(id){
        this.refs[id].makeEnabled();
    },
    endEditHandle: function(id){
        this.refs[id].makeDisabled();
    },
    componentDidMount: function() {

        this.worker = new Worker('js/backgroundWorker.js');
        this.worker.postMessage({cmd:'list'});
        this.worker.addEventListener('message', function(e) {
            switch(e.data.cmd){
                case 'list':
                    this.props.originProducts = e.data.data;
                    this.setState({products: this.props.originProducts});
                    break;
            }
        }.bind(this), false);

    },
    changeSorting: function(sortBy, sortOrder){
        this.worker.postMessage({cmd:'changeSorting', sortBy: sortBy, sortOrder: sortOrder});
    },
    searchHandle: function(str){
        this.worker.postMessage({cmd:'searchStr', searchStr: str});
    },
    render: function() {
        var products = this.state.products.map(function (product) {
            return (
                <div className='product' key =             {product._id}>

                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.addHandle.bind(this, product._id)}></input>
                    <div className="btn-group btn-group-xs">
                        <a className="btn btn-block btn-default  dropdown-toggle" data-toggle="dropdown">
                            <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                            <li>
                                <a className="btn btn-xs edit" data-toggle="dropdown dropdown2" onClick={this.editHandle.bind(this, product._id)}>
                                    <i className="icon-pencil">Править</i>
                                </a>
                            </li>
                            <li>
                                <a className="btn btn-xs btn-danger remove" data-toggle="dropdown" onClick={this.removeHandle.bind(this, product._id)}>
                                    <i className="icon-trash">Удалить</i>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className='inline-block'>
                        <ReactProduct
                                hide=             {{details: true, mass: true}}
                                enabled =         {false}
                                ref =             {product._id}
                                changeHandle=     {this.changeHandle}
                                id =              {product._id}
                                description =     {product.description}
                                proteins =        {product.proteins}
                                triglyceride =    {product.triglyceride}
                                carbohydrate =    {product.carbohydrate}
                                calorie =         {product.calorie}
                                mass =            {product.mass}
                                details =         {product.details}>
                        </ReactProduct>
                    </div>
                </div>
            );
        }.bind(this));
        return (
            <div className="productList">
                <Sorting ref='sortBar' searchHandle={this.searchHandle} changeHandle={this.changeSorting}/>
                <div className='product newProduct'>
                    <input type='button' className='btn btn-xs btn-default inline-block item' value='+' onClick={this.newProduct}></input>
                    <div className='inline-block'>
                        <ReactProduct
                            enabled={true}
                            ref='newProduct'
                            hide=             {{details: true, mass: true}}/>
                    </div>
                </div>
                {products}
            </div>
        );
    }
});
React.render(
    <ReactProductList />,
    document.getElementById('productList')
);