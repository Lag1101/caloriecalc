/**
 * Created by vasiliy.lomanov on 17.06.2015.
 */

var Well = ReactBootstrap.Well;


var Sorting = React.createClass({
    searchHandle: function(e){
        var str = e.target.value;

        this.props.searchHandle && this.props.searchHandle(str);
    },
    changeHandle: function(event){
        var sortBy = this.refs.SortBy.getDOMNode().value;
        var sortOrder = this.refs.SortOrder.getDOMNode().value;


        this.props.changeHandle && this.props.changeHandle(sortBy, sortOrder);
    },
    render: function() {
        return (
            <Well bsSize='sm' className='product form-inline'>
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
            </Well>
        );
    }
});

module.exports = Sorting;