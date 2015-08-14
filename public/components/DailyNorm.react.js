/**
 * Created by vasiliy.lomanov on 11.06.2015.
 */

var React = require('react');

function Bound(bound){
    bound = bound || {};
    this.min = bound.min || 0;
    this.max = bound.max || 0;
    this.min = this.min.toFixed(2)
    this.max = this.max.toFixed(2)
}

var DailyNorm = React.createClass({
    calcCalorieNormPerDay: function(){
        var weight = React.findDOMNode(this.refs.weight).value;
        var height = React.findDOMNode(this.refs.height).value;
        var age = React.findDOMNode(this.refs.age).value;
        var activity = React.findDOMNode(this.refs.activity).value;

        var calorieNorm = 0.8 * activity * (655 + 9.6 * weight + 1.8 * height - 4.7 * age);

        var calorie = new Bound({
            min: calorieNorm - 250,
            max: calorieNorm + 100
        });
        var proteins = new Bound({
            min: calorie.min * 0.3 / 4,
            max: calorie.max * 0.35 / 4
        });
        var triglyceride = new Bound({
            min: calorie.min * 0.15 / 9,
            max: calorie.max * 0.2 / 9
        });
        var carbohydrate = new Bound({
            min: calorie.min * 0.45 / 4,
            max: calorie.max * 0.5 / 4
        });

        var body = {
            weight : weight,
            height : height,
            age : age,
            activity : activity
        };
        var norm = {
            calorie: calorie,
            proteins: proteins,
            triglyceride: triglyceride,
            carbohydrate: carbohydrate
        };
        this.setState({
            norm: norm,
            body: body
        });

        this.setBody(body);
        this.setNorm(norm);
    },
    handleChange: function(event){
        this.calcCalorieNormPerDay();
    },
    getInitialState: function() {
        return {
            body:{
                weight: 0,
                height: 0,
                age: 0,
                activity: 1.2
            },
            norm: {
                calorie: new Bound(),
                proteins: new Bound(),
                triglyceride: new Bound(),
                carbohydrate: new Bound()
            }
        }
    },
    setBody: function(body){
        this.socket.emit('setBody', body);
    },
    setNorm: function(norm){
        this.socket.emit('setNorm', norm);
    },
    handleGetBody: function(body){
        this.setState({body: body});
        this.calcCalorieNormPerDay();
    },
    componentDidMount: function() {
        this.socket = require("../socket");

        this.socket.emit('getBody');
        this.socket.on('getBody', this.handleGetBody);
    },
    render: function() {
        var calorie = this.state.norm.calorie;
        var proteins = this.state.norm.proteins;
        var triglyceride = this.state.norm.triglyceride;
        var carbohydrate = this.state.norm.carbohydrate;

        var weight = this.state.body.weight;
        var height = this.state.body.height;
        var age = this.state.body.age;
        var activity = this.state.body.activity;

        return (
            <div className="dailyNorm">
                <div class="input-group input-group">
                    <div>
                        <label for="weight">Вес кг</label>
                        <input type='number' value={weight} ref='weight' id='weight' onChange={this.handleChange} placeholder='Вес кг'/>
                    </div>
                    <div>
                        <label for="height">Рост см</label>
                        <input type='number' value={height} ref='height' id='height' onChange={this.handleChange} placeholder='Вес кг'/>
                    </div>
                    <div>
                        <label for="age">Возраст лет</label>
                        <input type='number' value={age} ref='age' id='age'  onChange={this.handleChange} placeholder='Возраст лет'/>
                    </div>

                    <div>
                        <label for="activity">Вид активности</label>
                        <select value={activity} ref='activity' id='activity' onChange={this.handleChange} className='form-control-static'>
                            <option value={1.20}>Низкая (сидячий образ жизни)</option>
                            <option value={1.38}>Малая (1-3 раза в неделю легкие тренировки)</option>
                            <option value={1.55}>Средняя (1-5 раза в неделю умеренные тренировки)</option>
                            <option value={1.79}>Высокая (5-7 раза в неделю интенсивные тренировки)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label for="calorie-norm">Каллории</label>
                    <div id='calorie-norm'>
                        <p>{'Минимум: ' + calorie.min}</p>
                        <p>{'Максимум: ' + calorie.max}</p>
                    </div>
                    <label for="proteins-norm">Белки</label>
                    <div id='proteins-norm'>
                        <p>{'Минимум: ' + proteins.min}</p>
                        <p>{'Максимум: ' + proteins.max}</p>
                    </div>
                    <label for="triglyceride-norm">Жиры</label>
                    <div id='triglyceride-norm'>
                        <p>{'Минимум: ' + triglyceride.min}</p>
                        <p>{'Максимум: ' + triglyceride.max}</p>
                    </div>
                    <label for="carbohydrate-norm">Углеводы</label>
                    <div id='carbohydrate-norm'>
                        <p>{'Минимум: ' + carbohydrate.min}</p>
                        <p>{'Максимум: ' + carbohydrate.max}</p>
                    </div>
                </div>
            </div>
        );
    }
});

React.render(
    <DailyNorm />,
    document.getElementById('app')
);
