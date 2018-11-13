/**
 * Created by tz on 2017/11/17.
 */

var tz = tz || {};

/**
 * 动画管理
 * @type {{}}
 */
tz.AnimatorManager = {
    /**
     * 缩放
     * @param node 显示对象
     * @param from 开始大小
     * @param to 目标大小
     * @param duration 时间长度
     */
    scale : function (node,from,to,duration) {
        node.scale = from;

    }
};