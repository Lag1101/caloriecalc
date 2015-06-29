/**
 * Created by vasiliy.lomanov on 17.06.2015.
 */

var Sorting = React.createClass({
    getDefaultProps: function() {
        return {
            SortBy:         'description',
            SortOrder:         'greater'
        };
    },
    getInitialState: function() {
        return {
            SortBy:         this.props.SortBy,
            SortOrder:      this.props.SortOrder
        }
    },
    searchHandle: function(e){
        var str = e.target.value;

        this.props.searchHandle && this.props.searchHandle(str);
    },
    changeHandle: function(event){
        var sortBy = React.findDOMNode(this.refs.SortBy).value;
        var sortOrder = React.findDOMNode(this.refs.SortOrder).value;

        this.props.SortBy = sortBy;
        this.props.SortOrder = sortOrder;

        this.setState({
            SortBy: sortBy,
            SortOrder: sortOrder
        });

        this.props.changeHandle && this.props.changeHandle(sortBy, sortOrder);

    },
    componentDidMount: function(){

    },
    render: function() {
        return (
            <div className='product form-inline'>
                <select ref='SortBy' className='form-control input-sm' onChange={this.changeHandle}>
                    <option value="description">Имя</option>
                    <option value="proteins">Белки</option>
                    <option value="triglyceride">Жиры</option>
                    <option value="carbohydrate">Углеводы</option>
                    <option value="calorie">Ккал</option>
                </select>
                <select ref='SortOrder' className='form-control input-sm' onChange={this.changeHandle}>
                    <option value="greater">По возрастанию</option>
                    <option value="lower">По убыванию</option>
                </select>
                <input className="searchBox form-control input-sm" onChange={this.searchHandle} placeholder="Поиск по имени"></input>
            </div>
        );
    }
});