var DomainPlugin = require('../DomainPlugin');
var idGen = require('../../../commons/id');

var plugin = new DomainPlugin({
    name: 'id',
    prop: 'id',
    type: {
        type: String
    },
    use: function(schema, options){
        var method = 'autoId';

        //Add the property to schema
        schema.property(this.prop, this.type);

        /*
         * Get and store the Model's ID Generator by schema's name.
         * By default, schema and model have the same name
         */
        schema.idGenerator = idGen.get(schema.name());

        //Add a save method's Preprocessor for id auto-generating
        schema.pre('insert', function (next) {
            this[method]();
            next();
        });

        //Add a instance method to ensure id: generate, set and return id
        var prop = this.prop;
        schema.method(method, function (force) {
            var id = this.get(prop);
            if(force || !id){
                id = schema.idGenerator.next().toId();
                this.set(prop, id);
            }
            return id;
        })
    }
});

module.exports = plugin;