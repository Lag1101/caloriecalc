/**
 * Created by vasiliy.lomanov on 17.06.2015.
 */

var Sorting = React.createClass({
    getSortFunction: function(){
        var SortBy = this.state.SortBy;
        var SortOrder = this.state.SortOrder;

        var sort = function(sortBy, sortOrder, p1, p2){

            var mult = (SortOrder === "greater") ? -1 : 1;

            if (p1[sortBy] < p2[sortBy]) {
                return mult;
            }
            if (p1[sortBy] > p2[sortBy]) {
                return -mult;
            }
            // a must be equal to b
            return 0;
        };

        return sort.bind(null, SortBy, SortOrder);
    },
    getInitialState: function() {
        return {
            SortBy:         'description',
            SortOrder:         'greater'
        }
    },
    changeHandle: function(event){
        console.log(React.findDOMNode(this.refs.SortBy).value);
        this.state.SortBy = React.findDOMNode(this.refs.SortBy).value;
        this.state.SortOrder = React.findDOMNode(this.refs.SortOrder).value;
        this.setState({});

        this.props.changeHandle && this.props.changeHandle(this.getSortFunction());
    },
    componentDidMount: function(){

    },
    render: function() {
        return (
            <div className='product inline-block' onChange={this.changeHandle}>
                <select ref='SortBy' className='form-control-static'>
                    <option value="description">Имя</option>
                    <option value="proteins">Белки</option>
                    <option value="triglyceride">Жиры</option>
                    <option value="carbohydrate">Углеводы</option>
                    <option value="calorie">Ккал</option>
                </select>
                <select ref='SortOrder' className='form-control-static' onChange={this.changeHandle}>
                    <option value="greater">По возрастанию</option>
                    <option value="lower">По убыванию</option>
                </select>
            </div>
        );
    }
});