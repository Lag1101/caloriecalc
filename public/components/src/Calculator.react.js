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
    update: function(input){


        var expressions= input.split('\n');

        localStorage.setItem('calcInner', input);

        this.setState({
            result: this.calcExp(expressions)
        });
    },
    changeHandle: function(v){

        var dom = React.findDOMNode(this.refs.input);

        var input = dom.value;

        this.update(input);
    },
    componentDidMount: function(){
        function resize(){
            this.style.height = this.scrollHeight + 'px';
        }

        var dom = React.findDOMNode(this.refs.input);
        dom.addEventListener('keyup', resize, false);

        var input = localStorage.getItem("calcInner") || "";

        dom.value = input;
        resize.bind(dom)();

        this.update(input);
    },
    render: function() {
        var results = this.state.result.map(function(r, i){
            return <div key={i}>{r || '|'}</div>
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