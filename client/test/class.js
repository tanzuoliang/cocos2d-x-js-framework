/**
 * Created by ysjwdaypm on 2017/12/3.
 */
ClassManager.compileSuper.ClassManager = ClassManager;

/* Managed JavaScript Inheritance
 * Based on John Resig's Simple JavaScript Inheritance http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 * 在这里申明了，实现JS继承的方式 是参考了 John Resig's  的一个例子来实现的；并且有原文地址，有兴趣的同学可以去看看原版实现方式
 */
(function () {
    var fnTest = /\b_super\b/;
    var config = cc.game.config;
    var releaseMode = config[cc.game.CONFIG_KEY.classReleaseMode];
    if(releaseMode) {
        console.log("release Mode");
    }

    /**
     * The base Class implementation (does nothing)
     * @class
     */
    cc.Class = function () {
    };

    /**
     * Create a new Class that inherits from this Class
     * @static
     * @param {object} props
     * @return {function}
     */
    cc.Class.extend = function (props) {
        //声明_super对象，并赋值为原型
        var _super = this.prototype;

        // Instantiate a base Class (but only create the instance,
        // don't run the init constructor)

        //实例化创建prototype这个基类，只是创建实例，并没有跑init构造函数
        var prototype = Object.create(_super);

        //给这个class复制ID标识，并且将_super对象添加到ClassManager类管理器中
        var classId = ClassManager.getNewID();
        ClassManager[classId] = _super;
        // Copy the properties over onto the new prototype. We make function
        // properties non-eumerable as this makes typeof === 'function' check
        // unneccessary in the for...in loop used 1) for generating Class()
        // 2) for cc.clone and perhaps more. It is also required to make
        // these function properties cacheable in Carakan.
        //进行函数的验证检测，以及设置他使用基本设置
        var desc = { writable: true, enumerable: false, configurable: true };

        //单例模式的基础申明
        prototype.__instanceId = null;

        // The dummy Class constructor
        //创建Class这个类
        function Class() {
            this.__instanceId = ClassManager.getNewInstanceId();
            // All construction is actually done in the init method
            //如果这个类他存在.ctor方法，那么就默认的使用执行这个方法
            //ctor在JS中就相当于构造函数
            if (this.ctor)
                this.ctor.apply(this, arguments);
        }

        //给ID复制
        Class.id = classId;
        // desc = { writable: true, enumerable: false, configurable: true,
        //          value: XXX }; Again, we make this non-enumerable.
        desc.value = classId;
        Object.defineProperty(prototype, '__pid', desc);

        // Populate our constructed prototype object
        //把我们原型对象赋值
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        //将整个类赋值给desc.value
        desc.value = Class;
        //并且将类里构造的对象赋值
        Object.defineProperty(Class.prototype, 'constructor', desc);

        // Copy getter/setter
        //模拟get/set的方式，使用cc.clone函数来拷贝
        this.__getters__ && (Class.__getters__ = cc.clone(this.__getters__));
        this.__setters__ && (Class.__setters__ = cc.clone(this.__setters__));

        for(var idx = 0, li = arguments.length; idx < li; ++idx) {
            var prop = arguments[idx];
            for (var name in prop) {
                var isFunc = (typeof prop[name] === "function");
                var override = (typeof _super[name] === "function");
                var hasSuperCall = fnTest.test(prop[name]);

                if (releaseMode && isFunc && override && hasSuperCall) {
                    desc.value = ClassManager.compileSuper(prop[name], name, classId);
                    Object.defineProperty(prototype, name, desc);
                } else if (isFunc && override && hasSuperCall) {
                    desc.value = (function (name, fn) {
                        return function () {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-Class
                            //如果在新的对象方法里面添加._super()，他会继承父类的_super方法
                            //并且实现方法里面的所有对象及方法的赋值
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]);
                    Object.defineProperty(prototype, name, desc);
                } else if (isFunc) {
                    desc.value = prop[name];
                    Object.defineProperty(prototype, name, desc);
                } else {
                    prototype[name] = prop[name];
                }

                if (isFunc) {
                    // Override registered getter/setter
                    //如果是方法，那么重载里面的属性，并且实现get,set方法可以直接使用
                    var getter, setter, propertyName;
                    if (this.__getters__ && this.__getters__[name]) {
                        propertyName = this.__getters__[name];
                        for (var i in this.__setters__) {
                            if (this.__setters__[i] === propertyName) {
                                setter = i;
                                break;
                            }
                        }
                        cc.defineGetterSetter(prototype, propertyName, prop[name], prop[setter] ? prop[setter] : prototype[setter], name, setter);
                    }
                    if (this.__setters__ && this.__setters__[name]) {
                        propertyName = this.__setters__[name];
                        for (var i in this.__getters__) {
                            if (this.__getters__[i] === propertyName) {
                                getter = i;
                                break;
                            }
                        }
                        cc.defineGetterSetter(prototype, propertyName, prop[getter] ? prop[getter] : prototype[getter], prop[name], getter, name);
                    }
                }
            }
        }

        // And make this Class extendable
        // 可以使用Class.extend来实现类的继承
        Class.extend = cc.Class.extend;

        //add implementation method
        //添加要实现的方法
        Class.implement = function (prop) {
            for (var name in prop) {
                prototype[name] = prop[name];
            }
        };
        return Class;
    };
})();
