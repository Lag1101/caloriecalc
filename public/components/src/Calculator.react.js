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
    parseExpressions: function(){
        var input = React.findDOMNode(this.refs.input).value;
        var expressions= input.split('\n');

        return expressions.map(function(e){
            var result;
            try{
                result =math.eval(input);

                if(typeof result === "number")
                    result = [result];
                else
                    result = result.entires;
            } catch(e){
                result = e.message;
            }
            return result;
        });
    },
    calcExp: function(e){
        var result = math.eval(e);
        return (typeof result === 'number') ? [result] : result;
    },
    changeHandle: function(v){

        var dom = React.findDOMNode(this.refs.input);
        console.log(dom.selectionStart);
        var input = dom.value;
        var expressions= input.split('\n');

        var result = this.calcExp(expressions);

        this.setState({
            result: result
        });
    },
    componentDidMount: function(){
        function resize(){
            this.style.overflow = 'hidden';
            this.style.height = 0;
            this.style.height = this.scrollHeight + 'px';
        }
        React.findDOMNode(this.refs.input).addEventListener('keyup', resize, false);
    },
    render: function() {
        var results = this.state.result.map(function(r){
            return <div>{r || '|'}</div>
        });
        return (
            <div className={"input-group input-group-sm calculator " + this.props.className}>
                <textarea ref='input' type="text" className="form-control" placeholder="Посчитай меня" onInput={this.changeHandle}/>
                <span className="input-group-addon">{results}</span>
            </div>
        );
    }
});

module.exports = Calculator;