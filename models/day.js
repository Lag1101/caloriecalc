/**
 * Created by vasiliy.lomanov on 27.05.2015.
 */
var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;;
var ProductSchema = require('../models/product').ProductSchema;

var schema = new Schema({
    id:{
        type: Schema.Types.String,
        default: function(){
            var oId = new mongoose.Types.ObjectId();
            return oId.toString();
        }
    },
    date: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    main:{
        type: [ProductSchema],
        default: []
    },
    additional: {
        type: [ProductSchema],
        default: []
    }
});

schema.statics.fields = [
    'breakfast',
    'firstLunch',
    'secondLunch',
    'thirdLunch',
    'dinner',
    'secondDinner'
];

schema.statics.fieldIndexies = {
    breakfast: 0,
    firstLunch: 1,
    secondLunch: 2,
    thirdLunch: 3,
    dinner: 4,
    secondDinner: 5
};

schema.methods.getRaw = function(callback) {
    var day = this;

    var raw = {
        date: day.date,
        additional: [],
        id: day._id.toString()
    };
    async.parallel([
        function(cb){
            if(day.main.length > 0)
            async.forEachOf(Day.fields, function(field, index, cb){
                var product = day.main[index];
                raw[field] = product.getRaw();
                cb();
            },cb);
        },
        function(cb){
            async.map(day.additional, function(product, cb){
                raw.additional.push(product.getRaw());
                cb();
            },cb);
        }
    ], function(err){
        if(err) return callback(err);

        return callback(null, raw);
    });

};

schema.methods.update = function(newDaily) {
    this.date = newDaily.date;
    this.main = newDaily.main;
    this.additional = newDaily.additional;
};

schema.statics.createFromRaw = function(raw){
    var dayData = {
        date: raw.date,
        additional: [],
        main: []
        //id : raw.id ? raw.id : new Schema.Types.ObjectId()
    };

    var d = new Day(dayData);


    for(var i = 0; i < Day.fields.length; i++){
        d.main.push(raw[Day.fields[i]]);
    }

    raw['additional'].map(function(additional){
        d.additional.push(additional);
    });

    return d;
};

var Day = mongoose.model('Day', schema);
exports.Day = Day;
exports.DaySchema = schema;
