/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */
var NumericInput = React.createClass({
    getValue: function(){
        return this.props.value;
    },
    setValue: function(str){
        str = str.replace(/[^\d\.]/g, '');

        var valid = !isNaN(parseFloat(str));
        this.props.value = str;
        this.setState({
            value: str,
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
            value: str,
            valid: valid
        });

        this.props.changeHandle();
    },
    getDefaultProps: function() {
        return {
            value: 0,
            enabled: false,
            hidden: false
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
        if(this.props.hidden) return (<div/>);

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
        return this.props.value;
    },
    setValue: function(str){
        this.props.value = str;
        this.setState({value: str});
    },
    changeHandle: function(event){
        var str = React.findDOMNode(this.refs.div).innerHTML;
        this.props.value = str;
        this.setState({value: str});
        this.props.changeHandle();
    },
    getInitialState: function() {
        return {
            value: this.props.value,
            enabled: this.props.enabled
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
        if(this.props.hidden) return (<div/>);

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
