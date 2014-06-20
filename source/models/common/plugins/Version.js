var DomainPlugin = require('../DomainPlugin');
var idGen = require('../../../commons/id');

var plugin = new DomainPlugin({
    name: 'Version',
    prop: 'v',
    type: {
        type: Number
    },
    use: function(schema, options){
        var method = 'autoVersion';

        //Add the property to schema
        schema.property(this.prop, this.type);

        //Add a save method's Preprocessor for version upgrading
        schema.pre('insert', function (next) {
            this[method]();
            next();
        });
        schema.pre('update', function (next) {
            this[method]();
            next();
        });

        //Add a instance method to ensure version: generate, set and return version
        var prop = this.prop;
        schema.method(method, function () {
            var version = this.get(prop);
            if(!version){
                version = 1;
            }
            else{
                version++;
            }
            this.set(prop, version);
            return version;
        })
    }
});

module.exports = plugin;