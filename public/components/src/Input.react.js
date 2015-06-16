/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */
var NumericInput = React.createClass({
    getValue: function(){
        return this.props.value || 0.0;
    },
    changeHandle: function(event){
        var str = React.findDOMNode(this.refs.input).value;
        str = str.replace(',','.');
        str = str.replace(/[^\d\.]/g, '');
        this.setState({
            value: str,
            valid: !isNaN(parseFloat(str))
        });

        this.props.value = this.state.valid ? parseFloat(str) : 0.0;
        this.props.changeHandle();
    },
    getInitialState: function() {
        return {
            value: '0.0',
            valid: true,
            enabled: true
        }
    },
    render: function() {
        var value = this.state.value;
        var enabled = this.state.enabled;

        var className = "item ";
        if(!this.state.valid)
            className += "label-danger";
        else
            className += "label-success";

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
        return this.props.value || '';
    },
    changeHandle: function(event){
        this.props.value = React.findDOMNode(this.refs.div).innerHTML ;
        this.props.changeHandle();
    },
    getInitialState: function() {
        return {
            value: '',
            enabled: true
        }
    },
    render: function() {
        var value = this.props.value;
        var enabled = this.state.enabled;

        var className = "myLabel ";
        if(this.state.enabled)
            className += "enableForInput";
        else
            className += "disableForInput";

        return (
            <div contentEditable={enabled} ref='div' className={className}  onInput={this.changeHandle} dangerouslySetInnerHTML={{__html: value}} ></div>
        );
    }
});
