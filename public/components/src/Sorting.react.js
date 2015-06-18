/**
 * Created by vasiliy.lomanov on 17.06.2015.
 */

var Sorting = React.createClass({
    statics: {
        greater: function (sortBy, p1, p2) {
            if (p1[sortBy] < p2[sortBy]) return -1;
            if (p1[sortBy] > p2[sortBy]) return 1;
            return 0;
        },
        defaultCompare: function (sortBy, p1, p2) {
            if (p1[sortBy] < p2[sortBy]) return -1;
            if (p1[sortBy] > p2[sortBy]) return 1;
            return 0;
        }.bind(null, 'description'),
        less: function (sortBy, p1, p2) {
            if (p1[sortBy] < p2[sortBy]) return 1;
            if (p1[sortBy] > p2[sortBy]) return -1;
            return 0;
        }
    },
    getSortFunction: function(){
        var SortBy = this.props.SortBy;
        var SortOrder = this.props.SortOrder;

        if(SortOrder === "greater")
            return Sorting.greater.bind(null, SortBy);
        else
            return Sorting.less.bind(null, SortBy);
    },
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
    changeHandle: function(event){
        var sortBy = React.findDOMNode(this.refs.SortBy).value;
        var sortOrder = React.findDOMNode(this.refs.SortOrder).value;

        this.props.SortBy = sortBy;
        this.props.SortOrder = sortOrder;

        this.setState({
            SortBy: sortBy,
            SortOrder: sortOrder
        });

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