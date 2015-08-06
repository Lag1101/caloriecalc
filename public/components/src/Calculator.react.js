/**
 * Created by vasiliy.lomanov on 06.08.2015.
 */


var Calculator = React.createClass({
    getDefaultProps: function() {
        return {};
    },
    getInitialState: function() {
        return {
            result: []
        }
    },
    changeHandle: function(v){
        var input = React.findDOMNode(this.refs.input).value;
        //console.log();
        var result;
        try{
            result = '= ' + math.eval(input);
        } catch(e){
            result = e.message;
        }
        this.setState({
            result: result
        });
    },
    componentDidMount: function(){

    },
    render: function() {
        var result = this.state.result;

        return (
            <div className={"input-group input-group-sm calculator " + this.props.className}>
                <input ref='input' type="text" className="form-control" placeholder="Посчитай меня" onInput={this.changeHandle}/>
                <span className="input-group-addon">{result}</span>
            </div>
        );
    }
});

module.exports = Calculator;