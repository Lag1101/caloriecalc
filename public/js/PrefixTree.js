/**
 * Created by vasiliy.lomanov on 15.06.2015.
 */
var PrefixTree = {};

PrefixTree.Node = (function(){
    function Node(){
        this._links = [];
        this._nodes = {};
    }
    Node.prototype.removeString = function(str, link){
        var removeWord = this.removeWord.bind(this);
        str.split(' ').map(function(word){
            removeWord(word, link);
        });
    };
    Node.prototype.addString = function(str, link){
        var addWord = this.addWord.bind(this);
        str.split(' ').map(function(word){
            addWord(word, link);
        });
    };
    Node.prototype.getLinksByString = function(str){
        var allLinks = [];
        str.split(' ').map(function(word){
            var links = this.getLinksByWord(word);
            links.map(function(link){
                if(allLinks.indexOf(link) < 0) allLinks.push(link);
            })
        }.bind(this));

        return allLinks;
    };
    Node.prototype.getLinksByWord = function(word, index){
        index = index || 0;
        if( index >= word.length) return this._links;

        var letter = word[index];
        if( this._nodes[letter] === undefined ) return [];

        return this._nodes[letter].getLinksByWord(word, index+1);
    };
    Node.prototype.removeWord = function(word, link){
        var length = word.length;
        for(var i = 0; i < length-1; i++){
            removeWord(this, word.substr(i, length-i), link)
        }
    };

    Node.prototype.addWord = function(word, link){

        var length = word.length;
        for(var i = 0; i < length-1; i++){
            addWord(this, word.substr(i, length-i), link)
        }
    };

    function removeWord(node, word, link, index){
        index = index || 0;

        var i = node._links.indexOf(link);
        if( i >=  0)
            node._links.splice(i, 1);

        if(index >= word.length) return;

        var letter = word[index];
        if( node._nodes[letter] === undefined ) return;

        removeWord(node._nodes[letter], word, link, index+1);

        if(node._links.length === 0)
            delete node._nodes[letter];

    }
    function addWord(node, word, link, index){
        index = index || 0;

        if(node._links.indexOf(link) < 0)
            node._links.push(link);

        if(index >= word.length) return;

        var letter = word[index];
        if( node._nodes[letter] === undefined ) node._nodes[letter] = new Node();

        return addWord(node._nodes[letter], word, link, index+1);
    }



    return Node;
})();