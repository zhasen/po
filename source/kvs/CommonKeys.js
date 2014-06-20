var delimiter = ':'; //delimiter for all key generating
var rootPrefix = 'i' + delimiter; //the root prefix of ITEMS
var objectPrefix = rootPrefix + 'o'+ delimiter; //the root prefix of ITEMS
var collectionPrefix = rootPrefix + 'c'+ delimiter; //the root prefix of ITEMS
var keyGenerator = {
    objectGenerator: function(modelKey, id){
        return objectPrefix + modelKey + delimiter + id;
    },
    collectionGenerator: function(modelKey, colName){
        return collectionPrefix + modelKey + delimiter + colName;
    }
};

module.exports = {
    prefix: rootPrefix //TODO: to be deleted
    ,rootPrefix: rootPrefix
    ,objectPrefix: objectPrefix
    ,collectionPrefix: collectionPrefix
    ,objectGenerator: keyGenerator.objectGenerator
    ,collectionGenerator: keyGenerator.collectionGenerator
};