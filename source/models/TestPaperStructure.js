var partType = 'Part';
var partName = 'Part ';

var Structure = function(id, type, value, title){
    this.id = id;
    this.type = type;
    this.value = value;
    this.title = title;
    this.children = null;
    this.leaf = true;
};

Structure.prototype = {
    addChild: function(child){
        if(!this.children){
            this.children = [];
            this.leaf = false;
        }
        this.children.push(child);
    },
    addPart: function(index, name){
        if(!this.children){
            this.children = [];
        }

        if(index){
            index = this.children.length + 1;
        }
//        if(name) {
//            name = partName + index;
//        }

        var partId = this.id + index;
        var part = new Structure(partId, partType, partId, name);

        this.children.push(part);
    }
};

//var TPBS = function(){
//    this.structures = [];
//};
//
//TPBS.prototype = {
//    addChild: function(child){
//        this.structures.push(child);
//        return child;
//    },
//    json: function(){
//        return this.structures;
//    }
//};


module.exports = Structure;