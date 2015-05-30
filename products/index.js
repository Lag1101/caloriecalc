/**
 * Created by vasiliy.lomanov on 08.05.2015.
 */

var fs = require('fs');
var crypto = require('crypto');

function Products(){
    this.list = [];

    this.currentDish = [];

    this.dailyProducts = {};

    this.dishList = [];

    this.filename = 'productsList.json';

    this.date = "";
}

Products.prototype.addDaily = function(date, products) {
    this.dailyProducts[date] = products;
};

Products.prototype.getDaily = function(date) {
    return this.dailyProducts[date];
};

Products.prototype.load = function(cb) {
    var _this = this;

    fs.exists(this.filename, function(exist){
        if(!exist)
            return _this.save(cb);

        fs.readFile(_this.filename, {encoding: 'utf8'}, function (err, data) {
            if (err)
                return cb && cb(err);

            var o = JSON.parse(data);
            _this.list = o.list || [];
            _this.dailyProducts = o.dailyProducts || [];
            _this.currentDish = o.currentDish || [];
            _this.date = o.date || "";
            _this.dishList = o.dishList || [];

            _this.validate();

            return cb && cb(null, _this);
        });
    });


};

Products.prototype.save = function(cb) {
    var data = {
        list: this.list,
        dailyProducts: this.dailyProducts,
        currentDish: this.currentDish,
        date: this.date,
        dishList: this.dishList
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
    if(!product.id)
        product.id = Products.getUniqueId();
    this.list.push(product);
};

Products.prototype.validate = function(){
    for(var i = 0; i < this.list.length; i++) {
        var product = this.list[i];

        if(!product.id)
            product.id = Products.getUniqueId();
    }
};

Products.prototype.remove = function(id){
    for(var i = 0; i < this.list.length; i++) {
        var product = this.list[i];

        if(id === product.id) {
            this.list.splice(i, 1);
            break;
        }
    }
};

Products.getUniqueId = function(){
    var sid = Math.random().toString();

    var id = crypto.createHash('sha1');
    id.update(sid);

    return id.digest('hex');
};


module.exports.Products = Products;
module.exports.products = module.exports.products || new Products();