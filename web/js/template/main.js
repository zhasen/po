//define(['./common','./plugs/editor/editor','./designer.core','./designer.business'],
define(['./common','./designer.core','./designer.business','./designer.preview'],
function(common,core,business,preview) {
//function(common,editor,core,business) {
    var designer = {};
    designer.common = common;
    //designer.editor = editor;
    designer.core = core;
    designer.business = business;
    designer.preview = preview;
    return designer;
});