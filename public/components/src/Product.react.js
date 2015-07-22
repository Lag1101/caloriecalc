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
            hide:{},
            enabled:{all: true}
        };
    },
    getInitialState: function() {
        return {

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
        var enabled = this.props.enabled;
        return (
            <div className='inline-block'>
                <ReactTextInput    enabled={enabled.all || enabled.description}     css='description item'   changeHandle={this.changeHandle} value={this.props.description}      hidden={hide.description}          ref='description'></ReactTextInput>
                <ReactNumericInput enabled={enabled.all || enabled.proteins}        css='proteins item'      changeHandle={this.changeHandle} value={this.props.proteins}         hidden={hide.proteins}             ref='proteins'></ReactNumericInput>
                <ReactNumericInput enabled={enabled.all || enabled.triglyceride}    css='triglyceride item'  changeHandle={this.changeHandle} value={this.props.triglyceride}     hidden={hide.triglyceride}         ref='triglyceride'></ReactNumericInput>
                <ReactNumericInput enabled={enabled.all || enabled.carbohydrate}    css='carbohydrate item'  changeHandle={this.changeHandle} value={this.props.carbohydrate}     hidden={hide.carbohydrate}         ref='carbohydrate'></ReactNumericInput>
                <ReactNumericInput enabled={enabled.all || enabled.calorie}         css='calorie item'       changeHandle={this.changeHandle} value={this.props.calorie}          hidden={hide.calorie}              ref='calorie'></ReactNumericInput>
                <ReactNumericInput enabled={enabled.all || enabled.mass}            css='mass item'          changeHandle={this.changeHandle} value={this.props.mass}             hidden={hide.mass}                 ref='mass'></ReactNumericInput>
                <ReactTextInput    enabled={enabled.all || enabled.details}         css='details item'       changeHandle={this.changeHandle} value={this.props.details}          hidden={hide.details}              ref='details'></ReactTextInput>
            </div>
        );
    }
});