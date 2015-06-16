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
            id: null
        }
    },
    changeHandle: function(){
        console.log('product changed', this.getProduct());
    },
    render: function() {
        return (
            <div className='product'>
                <TextInput      changeHandle={this.changeHandle}   ref='description'></TextInput>
                <NumericInput   changeHandle={this.changeHandle}   ref='proteins'></NumericInput>
                <NumericInput   changeHandle={this.changeHandle}   ref='triglyceride'></NumericInput>
                <NumericInput   changeHandle={this.changeHandle}   ref='carbohydrate'></NumericInput>
                <NumericInput   changeHandle={this.changeHandle}   ref='calorie'></NumericInput>
                <NumericInput   changeHandle={this.changeHandle}   ref='mass'></NumericInput>
                <TextInput      changeHandle={this.changeHandle}   ref='details'></TextInput>
            </div>
        );
    }
});