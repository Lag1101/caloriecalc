/**
 * Created by vasiliy.lomanov on 18.06.2015.
 */

var Dish = React.createClass({
    saveHandle: function(event){

    },
    getDefaultProps: function() {
        return {
            id: ''
        };
    },
    getInitialState: function() {
        return {

        }
    },
    changeHandle: function(product){

    },
    render: function() {
        return (
            <div>
                <div className='product inline-block'>
                    <p>Full</p>
                    <ReactProduct
                        enabled =         {true}
                        ref='full'
                        hide=             {{description: true, details: true}}/>
                    <p>Portion</p>
                    <ReactProduct
                        enabled =         {true}
                        ref='portion'
                        hide=             {{description: true, details: true}}/>
                </div>
            </div>
        );
    }
});