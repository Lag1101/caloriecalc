/**
 * Created by vasiliy.lomanov on 17.06.2015.
 */

var Sorting = React.createClass({
    getInitialState: function() {
        return {
            SortBy:         'description',
            SortOrder:      'greater',
            searchStr:      ''
        }
    },
    searchHandle: function(e){
        var str = e.target.value;

        this.props.searchHandle && this.props.searchHandle(str);

        this.setState({
            searchStr: str
        });
    },
    changeHandle: function(event){
        var sortBy = this.refs.SortBy.getDOMNode().value;
        var sortOrder = this.refs.SortOrder.getDOMNode().value;

        this.setState({
            SortBy: sortBy,
            SortOrder: sortOrder
        });

        this.props.changeHandle && this.props.changeHandle(sortBy, sortOrder);

    },
    render: function() {
        return (
            <div className='product form-inline'>
                <select ref='SortBy' className='form-control input-sm' onChange={this.changeHandle} value={this.state.SortBy}>
                    <option value="description">Имя</option>
                    <option value="proteins">Белки</option>
                    <option value="triglyceride">Жиры</option>
                    <option value="carbohydrate">Углеводы</option>
                    <option value="calorie">Ккал</option>
                </select>
                <select ref='SortOrder' className='form-control input-sm' onChange={this.changeHandle} value={this.state.SortOrder}>
                    <option value="greater">По возрастанию</option>
                    <option value="lower">По убыванию</option>
                </select>
                <input className="searchBox form-control input-sm" onChange={this.searchHandle} placeholder="Поиск по имени"  value={this.state.searchStr}></input>
            </div>
        );
    }
});

module.exports = Sorting;