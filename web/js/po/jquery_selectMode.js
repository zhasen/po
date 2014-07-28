(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery'], factory);
    }
    else {
        factory(jQuery, moment);
    }
})(function ($) {
    $.fn.selectMode = function (o, b, c) {
        $(o).click(function () {
            $(b).show();
        })
        $(b + ' li').each(function () {
            $(this).click(function () {
                $(o).html($(this).find('a').html());
                $(c).val($(this).attr('v'));
                $(b).hide();
                if ($("#search")) {
                    $("#search").attr("value", $(this).children("a").attr("name"))
                }
                return false;
            })
        })
        $(document).click(function (e) {
            var p = e.target;
            while (p !== this) {
                if (p === $(b)[0] || p === $(o)[0]) return true;
                p = p.parentNode;
            }
            $(b).hide();
        })
    };
    return $;
});

