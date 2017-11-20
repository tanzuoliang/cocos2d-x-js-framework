var tianyi = tianyi || {};


tianyi.TYAlert = tianyi.TYAnimatorView.extend({
    ctor : function (name) {
        this._super(name);
    }
});

/**
 * 弹框管理（同时只能存在一个）
 */
tianyi.PopupManager = {
    showAlert : function (content,sureFun,cancelFun) {
        var su = function () {
            sureFun();
            LayerManager.removeLastView();
        };

        var cancel = function () {
            cancelFun();
            LayerManager.removeLastView();
        };

        //add alert component 
    },

};