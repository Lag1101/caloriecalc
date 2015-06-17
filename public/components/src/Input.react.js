/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */
var NumericInput = React.createClass({
    getValue: function(){
        return this.state.value || 0.0;
    },
    changeHandle: function(event){
        var str = React.findDOMNode(this.refs.input).value;
        str = str.replace(',','.');
        str = str.replace(/[^\d\.]/g, '');

        var valid = !isNaN(parseFloat(str))
        this.setState({
            value: str,
            valid: valid
        });

        this.props.changeHandle();
    },
    getDefaultProps: function() {
        return {
            value: 0,
            enabled: false
        };
    },
    getInitialState: function() {
        return {
            value: this.props.value,
            valid: true,
            enabled: this.props.enabled
        }
    },
    makeDisabled: function(){
        this.setState({enabled:false});
    },
    makeEnabled: function(){
        this.setState({enabled:true});
    },
    render: function() {
        var value = this.state.value;
        var enabled = this.state.enabled;

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

var TextInput = React.createClass({
    getValue: function(){
        return this.state.value || '';
    },
    changeHandle: function(event){
        this.setState({value: React.findDOMNode(this.refs.div).innerHTML});
        this.props.changeHandle();
    },
    getInitialState: function() {
        return {
            value: this.props.value,
            enabled: this.props.enabled || false
        }
    },
    makeDisabled: function(){
        this.setState({enabled:false});
    },
    makeEnabled: function(){
        this.setState({enabled:true});
    },
    getDefaultProps: function() {
        return {
            value: '',
            enabled: false
        };
    },
    render: function() {
        var value = this.state.value;
        var enabled = this.state.enabled;

        var className = this.props.css + " ";
        if(this.state.enabled)
            className += "enableForInput";
        else
            className += "disableForInput";

        return (
            <div contentEditable={enabled} ref='div' className={className}  onInput={this.changeHandle} dangerouslySetInnerHTML={{__html: value}} ></div>
        );
    }
});
