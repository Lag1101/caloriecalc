/**
 * Created by luckybug on 02.07.15.
 */
/// <reference path="jquery.d.ts" />

module InputCore{
    class InputBase{

        constructor(css:String){

        }

        get(){throw new Error('Called base class method!!!');}
        set(v){throw new Error('Called base class method!!!');}

        $get(){
            return this.$el;
        }
        onChange(v){
            console.log(v);
        }
        enable(v:boolean){
            this.$el.attr('disabled', !v);
        }
        protected valid(v){
            this.$el
                .removeClass(v ? 'label-danger' : 'label-success')
                .addClass(v ? 'label-success' : 'label-danger');
        }

        protected $el;
    }

    export class NumericInput extends InputBase{
        constructor(css:String){
            super(css);
            this.$el = $('<input type>')
                .attr('contenteditable', true)
                .on('input paste', function(){

                    var str = NumericInput.validate(this.get());
                    this.set(str);

                    if(NumericInput.isValid(str)) {
                        this.valid(true);
                        return this.onChange(str);
                    } else {
                        this.valid(false);
                    }

                }.bind(this))

            this.$el.addClass(css);
        }
        static validate(str:String):String{
            str = str.replace(',','.').replace(/[^\d\.]/g, '');
            return str;
        }
        static isValid(v):boolean{
            return !isNaN(parseFloat(v));
        }
        get(){
            return this.$el.val();
        }
        set(v){
            this.$el.val(v);
        }
        enable(v:boolean){
            this.$el.attr('disabled', !v);
        }
    }

    export class TextInput extends InputBase{

        constructor(css:String){
            super(css);
            this.$el = $('<div >')
                .attr('contenteditable', true)
                .on('input paste', function(){
                    this.onChange(this.get());
                }.bind(this));
            this.$el.addClass(css);
        }
        get(){
            return this.$el.html();
        }
        set(v){
            this.$el.html(v);
        }
    }
}