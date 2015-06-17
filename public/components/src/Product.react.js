/**
 * Created by vasiliy.lomanov on 16.06.2015.
 */


var Product = React.createClass({
    getProduct: function(){
        return {
            id: this.props.id,
            description: this.refs.description.getValue(),
            proteins: this.refs.proteins.getValue(),
            triglyceride: this.refs.triglyceride.getValue(),
            carbohydrate: this.refs.carbohydrate.getValue(),
            calorie: this.refs.calorie.getValue(),
            mass: this.refs.mass.getValue(),
            details: this.refs.details.getValue()
        };
    },
    getInitialState: function() {
        return {
            //id: null
        }
    },
    changeHandle: function(){
        //console.log('product changed', this.getProduct());
        this.props.changeHandle(this.getProduct());
    },
    render: function() {
        return (
            <div className='product'>
                <TextInput     css='description item'   changeHandle={this.changeHandle} value={this.props.description}     ref='description'></TextInput>
                <NumericInput  css='proteins item'      changeHandle={this.changeHandle} value={this.props.proteins}        ref='proteins'></NumericInput>
                <NumericInput  css='triglyceride item'  changeHandle={this.changeHandle} value={this.props.triglyceride}    ref='triglyceride'></NumericInput>
                <NumericInput  css='carbohydrate item'  changeHandle={this.changeHandle} value={this.props.carbohydrate}    ref='carbohydrate'></NumericInput>
                <NumericInput  css='calorie item'       changeHandle={this.changeHandle} value={this.props.calorie}         ref='calorie'></NumericInput>
                <NumericInput  css='mass item'          changeHandle={this.changeHandle} value={this.props.mass}            ref='mass'></NumericInput>
                <TextInput     css='details item'       changeHandle={this.changeHandle} value={this.props.details}     className='details'         ref='details'></TextInput>
            </div>
        );
    }
});