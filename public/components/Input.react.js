/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */

var NumericInput = React.createClass({
    getValue: function(){
        return parseFloat(this.props.value);
    },
    changeHandle: function(event){
        var str = this.refs.input.getDOMNode().value;
        str = str.replace(',','.');
        str = str.replace(/[^\d\.]/g, '');


        this.props.value = str;
        this.props.valid = !isNaN(parseFloat(str));
        this.props.changeHandle(parseFloat(this.props.value));

        this.forceUpdate();
    },
    makeDisabled: function(){
        this.props.enabled = false;
        this.forceUpdate();
    },
    makeEnabled: function(){
        this.props.enabled = true;
        this.forceUpdate();
    },
    getDefaultProps: function() {
        return {
            value: 0,
            enabled: false,
            hidden: false,
            danger: false,
            valid: true
        };
    },
    render: function() {
        //console.log('NumericInput rendered');
        if(this.props.hidden) return (<div className = {this.props.css + " hidden"}/>);

        var value = this.props.value;
        var enabled = this.props.enabled;

        var className = "";

        if(!this.props.valid || this.props.danger)
            className += " label-danger ";
        else if(!enabled)
            className += " disableForInput ";
        else
            className += " label-success ";


        className += this.props.css;


        if(enabled) return (
            <input ref='input' value={value} className={className} onChange={this.changeHandle}></input>
        );
        else return (
            <input ref='input' disabled value={value} className={className} onChange={this.changeHandle}></input>
        );
    }
});

var TextInput = React.createClass({
    getValue: function(){
        return this.props.value;
    },
    changeHandle: function(event){

        this.props.value = this.refs.div.getDOMNode().value;
        this.resize();
        this.props.changeHandle(this.props.value);
        this.forceUpdate();
    },
    getDefaultProps: function() {
        return {
            value: '',
            enabled: false
        };
    },
    makeDisabled: function(){
        this.props.enabled = false;
        this.forceUpdate();
    },
    makeEnabled: function(){
        this.props.enabled = true;
        this.forceUpdate();
    },
    resize: function(){
        if(this.props.hidden) return;
        var dom = this.refs.div.getDOMNode();
        dom.style.height = "1px";
        dom.style.height = dom.scrollHeight + 'px';
    },
    componentDidMount: function(){
        this.created = true;
        this.resize();
    },
    componentDidUpdate: function(){
        this.resize();
    },
    render: function() {
        if(this.props.hidden) return (<textarea className = {this.props.css + " hidden"}/>);

        var value = this.props.value;
        var enabled = this.props.enabled;

        var className = this.props.css + " ";

        if(enabled) return (
            <textarea ref='div' type="text" className={className}  onInput={this.changeHandle} value={value} ></textarea>
        );
        else return (
            <textarea disabled ref='div' type="text" className={className}  onInput={this.changeHandle} value={value} ></textarea>
        );
    }
});
module.exports.TextInput = TextInput;
module.exports.NumericInput = NumericInput;
