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

        if(this.props.valid)
            this.props.changeHandle(this.props.value);

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
            danger: false,
            valid: true
        };
    },
    render: function() {

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


       return (
            <input ref='input' disabled ={!enabled} value={value} className={className} onChange={this.changeHandle}></input>
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
        var value = this.props.value;
        var enabled = this.props.enabled;

        var className = this.props.css + " ";

        className += enabled ? " enableForInput " : " disableForInput ";

        return (
            <textarea disabled ={!enabled}  ref='div' type="text" className={className}  onInput={this.changeHandle} value={value} ></textarea>
        );
    }
});


var GeneralInput = React.createClass({
    render: function(){
        return this.props.type === 'text' ?
            (
                <TextInput {...this.props} />
            ) :
            (
                <NumericInput {...this.props} />
            )
    }
});
module.exports.GeneralInput = GeneralInput;
module.exports.TextInput = TextInput;
module.exports.NumericInput = NumericInput;
