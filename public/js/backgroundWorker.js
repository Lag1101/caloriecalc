/**
 * Created by vasiliy.lomanov on 29.06.2015.
 */
"use strict";

importScripts('../bower_components/socket.io-client/socket.io.js');
importScripts('PrefixTree.js');

var socket = io.connect('', {
    reconnect: true
});
var searchStr = '';
var originProducts = [];
var prefixTree = new PrefixTree.Node();
var sortingFun = greater.bind(null, 'description');

function greater (sortBy, p1, p2) {
    if (p1[sortBy] < p2[sortBy]) return -1;
    if (p1[sortBy] > p2[sortBy]) return 1;
    return 0;
}
function less(sortBy, p1, p2) {
    if (p1[sortBy] < p2[sortBy]) return 1;
    if (p1[sortBy] > p2[sortBy]) return -1;
    return 0;
}

socket
    .on('connect', function () {
        console.log("connected");

    })
    .on('disconnect', function () {
        console.log("disconnected");
    })
    .on('list', function(data){
        originProducts = data;
        buildPrefixTree(data);
        sendProducts();
    })
    .on('newProduct', function(newProduct){
        originProducts.push(newProduct);
        prefixTree.addString(newProduct.description, newProduct);

        sendProducts();
    });

self.onmessage = function(e) {
    console.log(e.data);
    switch(e.data.cmd){
        case 'list':
            socket.emit('list');
            break;
        case 'searchStr':
            searchStr = e.data.searchStr;
            sendProducts();
            break;
        case 'newProduct':
            socket.emit('newProduct', e.data.newProduct);
            break;
        case 'removeProduct':
            var id = e.data.id;
            for(var i = originProducts.length; i--; )
            {
                var product = originProducts[i];
                if(id === originProducts[i]._id){
                    prefixTree.removeString(product.description, product);
                    originProducts.splice(i, 1);
                    sendProducts();
                    socket.emit('removeProduct', id);
                    return;
                }
            }
            break;
        case 'changeSorting':
            var sortBy = e.data.sortBy;
            var sortOrder = e.data.sortOrder;

            sortingFun = (sortOrder === 'greater' ? greater : less).bind(null, sortBy);
            sendProducts();
            break;
    }
};


function sendProducts(){
    var choosenProducts = searchStr ? prefixTree.getLinksByString(searchStr) : originProducts;
    self.postMessage({cmd:'list', data: choosenProducts.sort(sortingFun)});
    //return choosedProducts.sort(this.props.compareFunction);
}

function buildPrefixTree(list){
    console.time("buildPrefixTree");
    list.map(function(product){
        prefixTree.addString(product.description, product);
    });
    console.timeEnd("buildPrefixTree");
}