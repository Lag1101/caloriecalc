/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */


var ReactProduct = React.createClass({
    getProduct: function(){
        var refs = this.refs;
        return {
            id:              this.props.id,
            description:     refs.description.getValue(),
            proteins:        refs.proteins.getValue(),
            triglyceride:    refs.triglyceride.getValue(),
            carbohydrate:    refs.carbohydrate.getValue(),
            calorie:         refs.calorie.getValue(),
            mass:            refs.mass.getValue(),
            details:         refs.details.getValue()
        };
    },
    getDefaultProps: function() {
        return {
            hide:{}
        };
    },
    getInitialState: function() {
        return {
            enabled:         this.props.enabled || false
        }
    },
    changeHandle: function(){
        this.props.changeHandle && this.props.changeHandle(this.getProduct());
    },
    makeDisabled: function(){
        var refs = this.refs;
        [
            refs.description,
            refs.proteins,
            refs.triglyceride,
            refs.carbohydrate,
            refs.calorie,
            refs.mass,
            refs.details
        ].map(function(ref){
                ref.makeDisabled();
            });
    },
    makeEnabled: function(){
        var refs = this.refs;
        [
            refs.description,
            refs.proteins,
            refs.triglyceride,
            refs.carbohydrate,
            refs.calorie,
            refs.mass,
            refs.details
        ].map(function(ref){
                ref.makeEnabled();
            });
    },
    componentDidMount: function(){

    },
    render: function() {
        var hide = this.props.hide;
        return (
            <div className='inline-block'>
                <ReactTextInput    enabled={this.state.enabled} css='description item'   changeHandle={this.changeHandle} value={this.props.description}      hidden={hide.description}          ref='description'></ReactTextInput>
                <ReactNumericInput enabled={this.state.enabled} css='proteins item'      changeHandle={this.changeHandle} value={this.props.proteins}         hidden={hide.proteins}             ref='proteins'></ReactNumericInput>
                <ReactNumericInput enabled={this.state.enabled} css='triglyceride item'  changeHandle={this.changeHandle} value={this.props.triglyceride}     hidden={hide.triglyceride}         ref='triglyceride'></ReactNumericInput>
                <ReactNumericInput enabled={this.state.enabled} css='carbohydrate item'  changeHandle={this.changeHandle} value={this.props.carbohydrate}     hidden={hide.carbohydrate}         ref='carbohydrate'></ReactNumericInput>
                <ReactNumericInput enabled={this.state.enabled} css='calorie item'       changeHandle={this.changeHandle} value={this.props.calorie}          hidden={hide.calorie}              ref='calorie'></ReactNumericInput>
                <ReactNumericInput enabled={this.state.enabled} css='mass item'          changeHandle={this.changeHandle} value={this.props.mass || 100.0}    hidden={hide.mass}                 ref='mass'></ReactNumericInput>
                <ReactTextInput    enabled={this.state.enabled} css='details item'       changeHandle={this.changeHandle} value={this.props.details}          hidden={hide.details}              ref='details'></ReactTextInput>
            </div>
        );
    }
});