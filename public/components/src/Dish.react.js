
var ReactDish = React.createClass({
    getDish: function(){
        return {
            id: this.props.id,
            description: this.props.description,
            portion: this.refs.portion.getProduct(),
            full: this.refs.full.getProduct()
        }
    },
    getDefaultProps: function() {
        return {
            hideDescription: false,
            description: "",
            full: {mass: 100},
            portion: {mass: 100}
        };
    },
    getInitialState: function() {
        return {
            full: this.props.full,
            portion: this.props.portion
        }
    },
    portionChangeHandle: function(){
        this.setState({
            portion: this.refs.portion.getProduct()
        });
        console.log(this.getDish())
    },
    fullChangeHandle: function(){
        this.setState({
            full: this.refs.full.getProduct()
        });
        console.log(this.getDish())
    },
    componentDidMount: function() {

    },
    render: function() {
        var fullP =     this.state.full;
        var portionP =  this.state.portion;

        var description = this.props.description;

        var full = {
            proteins:       this.props.full.proteins.toFixed(2),
            triglyceride:   this.props.full.triglyceride.toFixed(2),
            carbohydrate:   this.props.full.carbohydrate.toFixed(2),
            calorie:        this.props.full.calorie.toFixed(2),
            mass:           fullP.mass
        };

        var k = portionP.mass / fullP.mass;
        var portion = {
            proteins:       (this.props.full.proteins * k).toFixed(2),
            triglyceride:   (this.props.full.triglyceride * k).toFixed(2),
            carbohydrate:   (this.props.full.carbohydrate * k).toFixed(2),
            calorie:        (this.props.full.calorie * k).toFixed(2),
            mass:           portionP.mass
        };

        var descriptionCSS = 'description item';
        if(this.props.hideDescription)
            descriptionCSS += ' hidden ';
        return (
            <div>
                <ReactTextInput  enabled={true}  css={descriptionCSS}   changeHandle={this.changeHandle} value={description}        ref='description'></ReactTextInput>
                <ReactProduct
                    hide=             {{details: true, description: true}}
                    enabled =         {{mass:true}}
                    ref =             {'full'}
                    changeHandle=     {this.fullChangeHandle}
                    proteins =        {full.proteins}
                    triglyceride =    {full.triglyceride}
                    carbohydrate =    {full.carbohydrate}
                    calorie =         {full.calorie}
                    mass =            {full.mass}>
                </ReactProduct>
                <ReactProduct
                    hide=             {{details: true, description: true}}
                    enabled =         {{mass:true}}
                    ref =             {'portion'}
                    changeHandle=     {this.portionChangeHandle}
                    proteins =        {portion.proteins}
                    triglyceride =    {portion.triglyceride}
                    carbohydrate =    {portion.carbohydrate}
                    calorie =         {portion.calorie}
                    mass =            {portion.mass}>
                </ReactProduct>
            </div>
        );
    }
});