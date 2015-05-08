/**
 * Created by vasiliy.lomanov on 08.05.2015.
 */

var fs = require('fs');

function Products(){
    this.list = [];

    this.filename = 'productsList.json';
}

Products.prototype.load = function(cb) {
    var _this = this;
    fs.readFile(this.filename, {encoding: 'utf8'}, function (err, data) {
        if (err) throw err;

        _this.list = JSON.parse(data);

        return _this.save(function(err){
            if (err) throw err;

            return cb && cb(null, _this.list);
        });
    });
};

Products.prototype.save = function(cb) {
    fs.writeFile(this.filename, JSON.stringify(this.list), function(err) {
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