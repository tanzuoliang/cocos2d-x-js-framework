/**
 * Created by tianyi on 2017/11/16.
 */
var tianyi = tianyi || {};

// tianyi.events.Model.GET = "get";

tianyi.ModelBase = cc.Class.extend({

    /**
     *
     * @param name 数据模块名
     */
    ctor : function (name) {
        this._super();
        this.name = name;
    },

    /**
     * 通知管理器拿数据
     * @param type
     */
    broadcast : function (type) {
        tianyi.events.dispatcher.send(type);
    },

    /**
     *
     * @param action 接口
     */
    loadData : function (action) {
        //加载数据   name  action

    },

    /**
     * 数据加载完成
     * @param action 接口
     * @param data  响应数据
     */
    onDataComplete : function (action,data) {

    }
});