/**
 * Created by vasiliy.lomanov on 08.05.2015.
 */

var fs = require('fs');

function Products(){
    this.list = [];

    this.dailyProducts = {};

    this.filename = 'productsList.json';
}

Products.prototype.addDaily = function(date, products) {
    this.dailyProducts[date] = products;
};

Products.prototype.getDaily = function(date) {
    return this.dailyProducts[date];
};

Products.prototype.load = function(cb) {
    var _this = this;
    fs.readFile(this.filename, {encoding: 'utf8'}, function (err, data) {
        if (err) throw err;

        var o = JSON.parse(data);
        _this.list = o.list;
        _this.dailyProducts = o.dailyProducts;

        return cb && cb(null, _this.list);
    });
};

Products.prototype.save = function(cb) {
    var data = {
        list: this.list,
        dailyProducts: this.dailyProducts
    };
    fs.writeFile(this.filename, JSON.stringify(data), function(err) {
        if(err) {
            console.log(err);
            return cb && cb(err);
        } else {
            console.log("Файл сохранен.");
            return cb && cb(null);
        }
    });
};

Products.prototype.push = function(product) {
    this.list.push(product);
};


module.exports = Products;
module.exports.products = module.exports.products || new Products();