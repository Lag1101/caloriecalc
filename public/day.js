/**
 * Created by vasiliy.lomanov on 04.06.2015.
 */


var Day = (function(){
    function Day(day){
        this.constr(day);
    }
    Day.fields = [
        'breakfast',
        'firstLunch',
        'secondLunch',
        'thirdLunch',
        'dinner',
        'secondDinner'
    ];
    Day.prototype.constr = function(day) {
        var self = this;
        day = day || {};
        this.id =  (day.id || day._id ||  this.id) || '';
        this.description =  (day.description ||  this.description) || '';

        this.breakfast = (new Product(day.main[0]) ||      this.breakfast)  || '';
        this.firstLunch = (new Product(day.main[1]) ||      this.firstLunch)  || '';
        this.secondLunch = (new Product(day.main[2]) ||      this.secondLunch)  || '';
        this.thirdLunch = (new Product(day.main[3]) ||      this.thirdLunch)  || '';
        this.dinner = (new Product(day.main[4]) ||      this.dinner)  || '';
        this.secondDinner = (new Product(day.main[5]) ||      this.secondDinner)  || '';

        this.additional = this.additional || [];

        day.additional.map(function(newAd){
            self.additional.push(new Product(newAd))
        });
    };


    return Day;
})();