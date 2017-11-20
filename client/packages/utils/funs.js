/**
 * Created by tianyi on 2017/11/16.
 */
/**
 * 给对象定义常量
 * @param obj   对象目标
 * @param proto  常量属性
 * @param v      常量属性值
 */
function defineProperty(obj,proto,v){
    Object.defineProperty(obj,proto,{
        writeable : false,   //不可改写
        configurable : false,//
        enumerable : false,//不可遍历
        value :v
    });
}
