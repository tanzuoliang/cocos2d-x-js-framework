var tz = tz || {};


tz.TYAlert = tz.TYAnimatorView.extend({
    ctor : function (name) {
        this._super(name);
    }
});

/**
 * 弹框管理（同时只能存在一个）
 */
tz.PopupManager = {
    showAlert : function (content,sureFun,cancelFun) {
        var su = function () {
            sureFun && sureFun();
            LayerManager.removeLastView();
        };

        var cancel = function () {
            cancelFun && cancelFun();
            LayerManager.removeLastView();
        };

        //add alert component 
    },

};