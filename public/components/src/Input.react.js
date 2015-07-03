/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */
var ReactNumericInput = React.createClass({
    getValue: function(){
        return this.props.value;
    },
    setValue: function(str){
        str = str.replace(/[^\d\.]/g, '');

        var valid = !isNaN(parseFloat(str));
        this.props.value = str;
        this.setState({
            valid: valid
        });
    },
    changeHandle: function(event){
        var str = React.findDOMNode(this.refs.input).value;
        str = str.replace(',','.');
        str = str.replace(/[^\d\.]/g, '');

        var valid = !isNaN(parseFloat(str));

        this.props.value = str;
        this.setState({
            valid: valid
        });
        this.props.changeHandle();
    },
    getInitialState(){
        return {
            valid: true
        }
    },
    getDefaultProps: function() {
        return {
            value: 0,
            enabled: false,
            hidden: false
        };
    },
    makeDisabled: function(){
        this.props.enabled = false;
        this.setState();
    },
    makeEnabled: function(){
        this.props.enabled = true;
        this.setState();
    },
    render: function() {
        if(this.props.hidden) return (<div/>);

        var value = this.props.value;
        var enabled = this.props.enabled;

        var className = this.props.css + " ";
        if(!enabled)
            className += "disabled ";
        else if(!this.state.valid)
            className += "label-danger ";
        else
            className += "label-success ";



        if(enabled) return (
            <input ref='input' value={value} className={className} onChange={this.changeHandle}></input>
        );
        else return (
            <input ref='input' disabled value={value} className={className} onChange={this.changeHandle}></input>
        );
    }
});

var ReactTextInput = React.createClass({
    getValue: function(){
        return this.props.value;
    },
    setValue: function(str){
        this.props.value = str;
        this.setState();
    },
    changeHandle: function(event){
        var str = React.findDOMNode(this.refs.div).innerHTML;
        this.props.value = str;
        this.setState();
        this.props.changeHandle();
    },
    makeDisabled: function(){
        this.props.enabled = false;
        this.setState();
    },
    makeEnabled: function(){
        this.props.enabled = true;
        this.setState();
    },
    getDefaultProps: function() {
        return {
            value: '',
            enabled: false
        };
    },
    render: function() {
        if(this.props.hidden) return (<div/>);

        var value = this.props.value;
        var enabled = this.props.enabled;

        var className = this.props.css + " ";
        if(enabled)
            className += "enableForInput";
        else
            className += "disableForInput";

        return (
            <div contentEditable={enabled} ref='div' className={className}  onInput={this.changeHandle} dangerouslySetInnerHTML={{__html: value}} ></div>
        );
    }
});
