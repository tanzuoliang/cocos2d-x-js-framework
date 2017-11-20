/**
 * Created by tianyi on 2017/11/16.
 */

var tianyi = tianyi || {};

tianyi.events = {
    Model : {},//数据模型事件类型
    View : {},//显示对象事件类型
};

tianyi.events.IEvent = function () {
    this.eventList = {};
};

/**
 * 添加事件
 * @param type 事件类型
 * @param callback 事件回调方法
 * @param target   事件监听对象
 */
tianyi.events.IEvent.prototype.on = function (type,callback,target) {
    var list = null;
    if(this.eventList.hasOwnProperty(type)){
        list = this.eventList[type];
    }
    else{
        list = [];
        this.eventList[type] = list;
    }

    list[list.length] = [callback,target];
};

/**
 * 移除事件
 * @param type 事件类型
 * @param target 事件监听对象
 */
tianyi.events.IEvent.prototype.remove = function (type,target) {
    if(this.eventList.hasOwnProperty(type)){
        if(target){
            var list = this.eventList[type];
            for(var i = 0,len = list.length; i < len;i++){
                if(list[i][1] == target){
                    list.splice(i,1);
                    break;
                }
            }
        }
        else{
            this.eventList[type].length = 0;
        }
    }
};

/**
 * 删除所有
 */
tianyi.events.IEvent.prototype.removeAll = function () {
    for(var key in this.eventList){
        this.eventList[key].length = 0;
    }
};

tianyi.events.IEvent.prototype.send = function () {
    var parmaList = Array.prototype.slice.call(arguments,0);
    var type = parmaList.shift();
    if(this.eventList.hasOwnProperty(type)){
        var list = this.eventList[type];
        for(var i = 0,len = list.length; i < len;i++){
            list[i][0].apply(list[i][1],parmaList);
        }
    }
};

tianyi.events.IEvent.new = function () {
  return new tianyi.events.IEvent();
};

/**
 * 全局广播
 */
tianyi.events.dispatcher = tianyi.events.IEvent.new();