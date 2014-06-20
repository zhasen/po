var DomainPlugin = require('../DomainPlugin');
var timeGenerator = require('../../../commons/time');

var plugin = new DomainPlugin({
    name: 'updatedOn',
    prop: 'updOn',
    type: {
        type: Date,
        toData: function(value){
            return value ? value.getTime() : 0;
        },
        fromData: function(data){
            return data==0 || data=='0' ? null : new Date(Number(data));
        }
    },
    use: function(schema, options){
        var method = 'autoUpdatedOn';

        //Add the property to schema
        schema.property(this.prop, this.type);

        //Add a insert method's Preprocessor for updatedOn auto-generating
        schema.pre('insert', function (next) {
            this[method]();
            next();
        });

        //Add a insert method's Preprocessor for updatedOn auto-generating
        schema.pre('update', function (next) {
            this[method]();
            next();
        });

        //Add a instance method to ensure updatedOn: generate, set and return it
        var prop = this.prop;
        schema.method(method, function (time) {
            var v = this.get(prop);
            if(time){
                v = time;
                this.set(prop, v);
            }
            else {
                v = timeGenerator.currentTime();
                this.set(prop, v);
            }
            return v;
        });
    }
});

module.exports = plugin;