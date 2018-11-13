/**
 * Created by ysjwdaypm
 * Date : 2018/5/17.
 * Time : 下午3:46
 */


var component = component || {};

/**
 启动模块
 **/
(function (component) {

    component.ScrollView = ccui.ScrollView.extend({

        last_p : 0,
        dir : null,
        innerContainer : null,
        ctor : function () {
            this._super();
            this.addEventListener(this.onScrolling.bind(this));
            this.innerContainer = this.getInnerContainer();
            this.last_p = this.innerContainer.x;
            this.setScrollBarEnabled(false);
            this.setInertiaScrollEnabled(false);
        },

        setDirection : function(dir){
            this._super(dir);
            this.dir = dir;
            switch (dir){
                case ccui.ScrollView.DIR_HORIZONTAL:
                    this.last_p = this.innerContainer.x;
                    break;
                case ccui.ScrollView.DIR_VERTICAL:
                    this.last_p = this.innerContainer.y;
                    break;
            }
        },

        setSize : function(scrollWidth,scrollHeight,itemWidth,itemHeight){
            this._super(scrollWidth,scrollHeight);
            this.scrollWidth = scrollWidth;
            this.scrollHeight = scrollHeight;
            this.itemWidth = itemWidth;
            this.itemHeight = itemHeight;
        },

        onScrolling : function (sender,type) {
            if (type == ccui.ScrollView.EVENT_AUTOSCROLL_ENDED ||
                type == ccui.ScrollView.EVENT_ENDED) {


                if(this.dir == ccui.ScrollView.DIR_HORIZONTAL){
                    if (Math.abs(this.last_p - this.innerContainer.x) > 1) {
                        
                        var _x = this.innerContainer.x;
                        var col = Math.round(_x / this.itemWidth);

                        _x = col * this.itemWidth;
                        _x = Math.min(0, Math.max(_x, this.scrollWidth - this.innerWidth));
                        this.innerContainer.stopAllActions();
                        this.innerContainer.runAction(cc.sequence([
                            cc.MoveTo(0.2, _x, 0),
                            cc.callFunc(function () {
                                this.last_p = this.innerContainer.x;
                                this.onStopScroll();
                            }.bind(this))
                        ]));
                    }
                }
                else if(this.dir == ccui.ScrollView.DIR_VERTICAL){
                    if (Math.abs(this.last_p - this.innerContainer.y) > 1) {
                        
                        var _y = this.innerContainer.y;
                        var row = Math.round(_y / this.itemHeight);

                        _y = row * this.itemHeight;
                        _y = Math.min(0, Math.max(_y, this.scrollHeight - this.innerHeight));
                        this.innerContainer.stopAllActions();
                        this.innerContainer.runAction(cc.sequence([
                            cc.MoveTo(0.2, 0, _y),
                            cc.callFunc(function () {

                                this.last_p = this.innerContainer.y;
                                this.onStopScroll();
                            }.bind(this))
                        ]));
                    }
                }


            }
            else if (type == ccui.ScrollView.EVENT_CONTAINER_MOVED) {
                this.innerContainer.stopAllActions();
            }
        },

        onStopScroll : function () {

        }
    });


    component.TableView = cc.Node.extend({

        /**
         *总数据
         */
        tableData : null,

        /**
         *ITEM 类
         */
        itemRender : null,

        /**
         *ITEM 尺寸
         */
        itemSize : null,

        /**
         *可视区域心大小
         */
        viewSize : null,

        /**
         *世界尺寸大小
         */
        worldSize : null,

        /**
         *滚动容器
         */
        scroll : null,

        /**
         *可视区域内的列数
         */
        viewCols : 0,

        /**
         * 可视区域内的行数
         */
        viewRows : 0,

        /**
         * 一开始要渲染的行数
         */
        renderRows : 0,

        /**
         * 总行数
         */
        totalRows : 0,

        /**
         *显示物体超出可视区域的坐标偏移值
         */
        itemOffsetHeight : 0,

        /**
         *当前
         */
        itemsArr : null,


        scrollBoundRect : null,

        onSelectCallFunc : null,

        currentSelectItem : null,

        defaultIndex : 0,
        

        // ctor : function (viewSize) {

        /**
         *
         * @param config
         * {
            viewSize    : null,
            itemCls : null,
            itemSize : null,
            x       : null,
            y       : null,
            parent  : null,
            data    : null,
            showType    : 2
        }
         */
        ctor : function (config) {
            this._super();
            this.scroll = ccui.ScrollView.create();

            // this.scroll.setDirection(ccui.ScrollView.DIR_VERTICAL);
            this.scroll.setTouchEnabled(true);
            this.scroll.setDirection(ccui.ScrollView.DIR_VERTICAL);
            this.scroll.setBounceEnabled(config.hasOwnProperty("bounce") ? config.bounce :true);

            this.scroll.setScrollBarEnabled(false);

            this.viewSize = config.viewSize;
            this.scroll.setSize(this.viewSize.width,this.viewSize.height);
            this.scrollBoundRect = cc.rect(0,0,this.viewSize.width,this.viewSize.height);
            this.addChild(this.scroll);

            // this.scroll.setGlobalZOrder(10);

            this.itemsArr = [];

            /**
             * table.setItemRenderer(item,cc.size(100,100));
             table.setTableData(list);
             table.x = 100;
             table.y = 200;
             layer.addChild(table);
             */

            this.setItemRenderer(config.itemCls,config.itemSize);
            if(config.hasOwnProperty("x"))
                this.x = config.x;

            if(config.hasOwnProperty("y"))
                this.y = config.y;

            if(config.hasOwnProperty("parent"))
                config.parent.addChild(this,config.localZorder || 99);

            this.showType = config.showType || 2;
            this.showTime = config.showTime || 0.12;

            this.extraSpace = config.extraSpace || 0;
            this.showAll = config.showAll || false;
            !this.showAll && this.scroll.addEventListener(this.onScrolling.bind(this));

            if(config.hasOwnProperty("data")){
                this.setTableData(config.data);
            }

        },

        getContainer : function () {
            return this.scroll;
        },

        getMaxSize : function () {
            return cc.size(this.worldSize.width,this.worldSize.height);
        },

        onScrolling : function (sender,type) {
            var now  = this.scroll.getInnerContainerPosition().y;
            if(now > this.lastInnerPosY){
                this.moveUp();
            }
            else if(now < this.lastInnerPosY){
                this.moveDown();
            }

            this.lastInnerPosY = now;
        },

        onEnter : function () {
          this._super();
          // this.scheduleUpdate();
          // this.initItem();
        },


        // update : function (dt) {
        //     var now  = this.scroll.getInnerContainerPosition().y;
        //     if(now > this.lastInnerPosY){
        //         this.moveUp();
        //     }
        //     else if(now < this.lastInnerPosY){
        //         this.moveDown();
        //     }
        //
        //     this.lastInnerPosY = now;
        // },

        moveUp : function () {
            var index = -1;
            for(var i = 0, len = this.itemsArr.length, item = null,pos; i < len ; i++){
                item = this.itemsArr[i];
                pos = this.convertToNodeSpace(item.convertToWorldSpace(cc.p(0,0)));
                if(pos.y > this.viewSize.height && (item.__row__ + this.renderRows) < this.totalRows){
                    item.__beforeResetData__();
                    item.y -= this.itemOffsetHeight;
                    item.__row__ += this.renderRows;
                    index = item.__row__ * this.viewCols + item.__col__;
                    item.setData && item.setData(this.tableData[index],index);
                }
            }
        },

        moveDown : function () {
            var index = -1;
            for(var i = 0, len = this.itemsArr.length, item = null,pos; i < len ; i++){
                item = this.itemsArr[i];
                pos = this.convertToNodeSpace(item.convertToWorldSpace(cc.p(0,0)));
                if(pos.y < -this.itemSize.height && (item.__row__ - this.renderRows) >= 0){
                    item.__beforeResetData__();
                    item.y += this.itemOffsetHeight;
                    item.__row__ -= this.renderRows;
                    index = item.__row__ * this.viewCols + item.__col__;
                    item.setData && item.setData(this.tableData[index],index);
                }
            }
        },

        //----------------------------------------------------------------------
        setItemRenderer : function (itemRender,itemSize) {
            this.itemRender = itemRender;
            this.itemSize = itemSize;

            this.viewCols = Math.floor(this.viewSize.width / this.itemSize.width);
            this.viewRows = Math.ceil(this.viewSize.height / this.itemSize.height);

            cc.log("this.viewCols = " + this.viewCols);
            cc.log("this.viewRows = " + this.viewRows);
        },


        reset : function (config) {
            if(config.hasOwnProperty("viewSize")){
                this.viewSize = config.viewSize;
                this.scroll.setSize(this.viewSize.width,this.viewSize.height);
                this.scrollBoundRect = cc.rect(0,0,this.viewSize.width,this.viewSize.height);
            }


            this.setItemRenderer(config.itemCls || this.itemRender,config.itemSize || this.itemSize);
            return this;
        },


        setTableData : function (data,defaultIndex) {
            this.defaultIndex = defaultIndex || 0;
            if(this.currentSelectItem){
                this.currentSelectItem.onUnselect();
                this.currentSelectItem = null;
            }

            this.tableData = data;
            var len = this.itemsArr.length;
            if(len > 0){
                for(var i = 0  , item = null; i < len;i++){
                    item = this.itemsArr[i];
                    cc.pool.putInPool(item);
                    item.removeFromParent();
                }

                this.itemsArr.length = 0;
            }

            if(data){
                this.totalRows = Math.ceil(this.tableData.length / this.viewCols);
                if(this.showAll){this.viewRows = this.totalRows}
                this.worldSize = cc.size(this.viewSize.width,Math.max(this.itemSize.height * this.totalRows + this.extraSpace,this.viewSize.height));
                this.scroll.setInnerContainerSize(this.worldSize);

                cc.log("this.totalRows = " + this.totalRows);
                cc.log("this.worldSize width = " + this.worldSize.width + " , height = " + this.worldSize.height);

                this.initItem();
            }
            
            return this;

        },


        getItem : function (index) {
            return this.itemsArr[index];
        },

        /**
         * 检测点是否在可视区内
         * @param pos
         * @returns {Boolean}
         */
        checkTouchInScrollView : function (pos) {
            var pos = this.scroll.convertToNodeSpace(pos);
            return cc.rectContainsPoint(this.scrollBoundRect,pos);
        },

        initItem : function () {
            if(!this.tableData)return;
            var datalen = this.tableData.length;
            if(datalen == 0)return;
            var rows = Math.min(this.viewRows + 1,this.totalRows);
            var item = null;
            var index = -1;
            // cc.log("tableView initItem data = " + JSON.stringify(this.tableData))
            loop:
            for(var i = 0; i < rows; i++){
                for(var j = 0 ; j < this.viewCols;j++){
                    // item = new this.itemRender();
                    item = cc.pool.getFromPool(this.itemRender);
                    item.initConfig({
                        viewSize                : this.itemSize,
                        checkTouchInScrollView  : this.checkTouchInScrollView.bind(this),
                        onSelectCallFunc        : this.onSelectItem.bind(this),
                        showType                : this.showType,
                        showTime                : this.showTime
                    });

                    item.x = j * this.itemSize.width;
                    item.y = this.worldSize.height - (i + 1) * this.itemSize.height - this.extraSpace;
                    // console.log("item.y = " + item.y +  " , len = " + (i * this.viewCols + j + 1) + " , tot = " + datalen);
                    item.__col__ = j;
                    item.__row__ = i;
                    index = item.__row__ * this.viewCols + item.__col__;
                    item.setData && item.setData(this.tableData[index],index);

                    this.scroll.addChild(item);
                    this.itemsArr[this.itemsArr.length] = item;

                    if((i * this.viewCols + j + 1) == datalen){
                        break loop;
                    }
                }
            }

            if(this.defaultIndex < this.itemsArr.length){
                this.currentSelectItem = this.itemsArr[this.defaultIndex];
                this.currentSelectItem.onSelect();
            }

            this.itemOffsetHeight = rows * this.itemSize.height;
            this.renderRows = rows;

            this.scroll.jumpToTop();
            
            
            this.lastInnerPosY = this.scroll.getInnerContainerPosition().y;

            // cc.log("[item] ---------------------------------------------------- " + (this.viewSize.height - 
            
            //cc.log("[tableView]  view:height = " + this.viewSize.height + " , worldSize:height = " + this.worldSize.height + " this.lastInnserPosY = " + this.lastInnerPosY);
        },

        onSelectItem : function (item,data) {
            cc.log("[tableview] selectItem " + item.index);
            if(this.currentSelectItem)
                this.currentSelectItem.onUnselect();

            this.currentSelectItem = item;
            this.currentSelectItem.onSelect();

            if(this.onSelectCallFunc != null){
                this.onSelectCallFunc(item,data);
            }
        },

        //-------------------------------------
        onExit : function () {
            this._super();
            this.itemsArr = null;
            this.tableData = null;

            // this.unscheduleUpdate();

            cc.pool.drainCertainPool(this.itemRender);

            cc.log("-----------[table] onExit");
        }
    });


    component.TableView.create = function (config) {
        return new component.TableView(config);
    };


    component.BaseTableItem = uicore.Pane.extend({
        data                    : null,
        index                   : -1,
        checkTouchInScrollView  : null,
        viewSize                : null,

        __row__                 : 0,
        __col__                 : 0,

        onSelectCallFunc         : null,

        inited :false,

        showType                : 1,
        showTime                : 0.12,

        aniPoint                : null,

        initConfig : function (config) {
            if(!this.inited){
                this.checkTouchInScrollView = config.checkTouchInScrollView;
                this.viewSize = config.viewSize;
                this.onSelectCallFunc = config.onSelectCallFunc;
                this.inited = true;
                this.showType = config.showType;
                this.showTime = config.showTime;
            }
        },

        __beforeResetData__ : function () {
            this.stopAllActions();
            this.x = this.aniPoint.x;
            this.y = this.aniPoint.y;
        },

        setData : function (data,index) {
            this.data = data;
            this.index = index;
            this.visible = !!data || data == 0;
            this.aniPoint = cc.p(this.x,this.y);
        },

        onEnter : function () {
            this._super();
            if(!!this.data){
                switch (this.showType){
                    case 1:
                        break;
                    case 2:
                        this.moveFromBottom(this.showTime);
                        break;
                    case 3:
                        if(this.__row__ % 2 == 0){
                            this.moveFromLeft(this.showTime);
                        }else{
                            this.moveFromRight(this.showTime);
                        }
                        break;
                    case 4:
                        this.groupMoveFromBottom(this.showTime);
                        break;
                }
            }
        },

        groupMoveFromBottom : function (time) {
            var y = this.y;
            this.y = y - this.viewSize.height * 0.6;
            this.visible = false;
            this.runAction(cc.sequence([
                cc.delayTime(this.__row__ * time + this.__col__ * time * 0.5),
                cc.show(),
                cc.moveTo(time,this.x,y)
                // cc.EaseBackOut(cc.moveTo(time,this.x,y))
            ]));
        },

        //
        moveFromBottom : function (time) {
            var y = this.y;
            this.y = y - this.viewSize.height * 0.6;
            this.visible = false;
            this.runAction(cc.sequence([
                cc.delayTime(this.__row__ * time),
                cc.show(),
                cc.EaseBackOut(cc.moveTo(time,this.x,y))
            ]));
        },

        moveFromLeft : function (time) {
            var x = this.x;
            this.x -= 640;
            this.visible = false;
            this.runAction(cc.sequence([
                cc.delayTime(this.__row__ * time),
                cc.show(),
                cc.EaseBackOut(cc.moveTo(time,x,this.y))
            ]));
        },

        moveFromRight : function (time) {
            var x = this.x;
            this.x += 640;
            this.visible = false;
            this.runAction(cc.sequence([
                cc.delayTime(this.index * time),
                cc.show(),
                cc.EaseBackOut(cc.moveTo(time,x,this.y))
            ]));
        },

        onExit : function () {
            this._super();
            this.listener && cc.eventManager.removeListener(this.listener);
            this.listener = null;
            this.checkTouchInScrollView = null;
        },

        /**
         * 是否有效点击
         * @param touch 触点
         * @returns {boolean}
         */
        validTouch : function (touch) {
            var pos = touch.getLocation ?  touch.getLocation() : touch;
            if(this.visible && (this.checkTouchInScrollView == null || this.checkTouchInScrollView(pos))
                && cc.rectContainsPoint(cc.rect(1,1,this.viewSize.width - 1,this.viewSize.height - 1),this.convertToNodeSpace(pos))){
                return true;
            }
            cc.log("tableView  is a inavlid touch");
            return false;
        },

        onSelect : function () {

        },

        onUnselect : function () {

        }
    });
    //---------------------------------------------------- test ------------------------

    var itemCount = 0;

    var item = component.BaseTableItem.extend({

        ctor : function () {
            this._super();
            
            var layer = cc.LayerColor.create(cc.color(255,0,255),99,98);
            this.addChild(layer);
            layer.x = layer.y = 1;
            //layer.setGlobalZOrder(1);
            
            this.label = new cc.Label();
            this.label.initWithTTF("","res/font/huakanghaibaojianti.TTC",36);
            this.label.x = 50;
            this.label.y = 50;
            this.label.setVertexZ(2);
            // this.label.setSystemFontSize(36);
            this.addChild(this.label);
            //this.label.setGlobalZOrder(200);

            itemCount++;

            // cc.log("[item] create");


            
        },
        
        setData : function (data,index) {
            this._super(data,index);
            if(!!data){
                this.label.setString("" + data);
            }

        },


        onEnter : function () {
            this._super();
            this.listener = cc.eventManager.addListener({
                               event: cc.EventListener.TOUCH_ONE_BY_ONE,
                               swallowTouches: false,//默认情况下事件不下透
                               onTouchBegan: this.onTouchBegan.bind(this),
                               onTouchMoved: function(){},
                               onTouchEnded: function(){},
                               onTouchCancelled:function(){}
                           }, this);
        },

        onTouchBegan : function (touch,event) {
            if(this.validTouch(touch)){
                this.onSelectCallFunc && this.onSelectCallFunc(this,this.data);
                return true;
            }

            return false;
        }
    });


    component.executeTest = function () {
        cc.director.setProjection(cc.Director.PROJECTION_2D);

        var scene = new cc.Scene();
        var layer = new cc.Layer();
        scene.addChild(layer);
        cc.director.runScene(scene);

        var list = [];
        for(var i = 1; i <= 110;i++){
            list.push(i);
        }

        component.TableView.create({
            viewSize    : cc.size(300,700),
            itemCls     : item,
            itemSize    : cc.size(100,100),
            x           : 10,
            y           : 200,
            parent      : layer,
        }).setTableData(list).onSelectCallFunc = function (item,data) {
            cc.log("1 get touch " + data);
        };


        component.TableView.create({
            viewSize    : cc.size(300,700),
            itemCls     : item,
            itemSize    : cc.size(100,100),
            x           : 330,
            y           : 200,
            parent      : layer,
            showType    : 2
        }).setTableData(list).onSelectCallFunc = function (item,data) {
            cc.log("2 get touch " + data);
        };

    }


    //--------------------------------------  group ---------------------------------------
    component.GroupElementProxy = function (item,sel,unsel,index) {
        this.item = item;
        this.sel = sel;
        this.unsel = unsel;
        this.index = index;
    }

    component.GroupElementProxy.prototype.onSelect = function () {
        this.sel && this.sel(this.item,this.index);
    }


    component.GroupElementProxy.prototype.onUnselect = function () {
        this.unsel && this.unsel(this.item,this.index);
    }

    component.GroupElementProxy.prototype.clean = function () {
        this.item = null;
        this.sel = null;
        this.unsel = null;
    }

    var __group_index__ = 0;

    component.Group = function (musicType,checkCallFunc) {
        this.musicType = musicType;
        this.curProxy = null;
        this.proxys = [];

        this.enabled = true;

        this.id = __group_index__++;

        this.checkValidTouchCallFunc = checkCallFunc;
    };

    component.Group.prototype.setEnabled = function (enabled) {
        this.enabled = enabled;
    };

    component.Group.prototype.addTab = function (item,select,unselect) {
        var proxy = new component.GroupElementProxy(item,select,unselect,this.proxys.length);
        this.proxys.push(proxy);
        uicore.ComponentManager.registerClick(item,this.onSelect.bind(this,proxy),this.musicType);
        return this;
    };

    component.Group.prototype.addTabs = function (items,select,unselect,defaultIndex) {
        cc.log("[" + this.id + "proxy] add Tabs " + items.length);
        for(var i = 0,len = items.length , proxy = null , item = null ; i < len;i++){
            item = items[i];
            proxy = new component.GroupElementProxy(item,select,unselect,this.proxys.length);
            this.proxys.push(proxy);
            uicore.ComponentManager.registerClick(item,this.onSelect.bind(this,proxy),this.musicType);
        }

        if (typeof defaultIndex !== "undefined") {
            this.setDefaultIndex(defaultIndex);
        }

        return this;
    };

    component.Group.prototype.onSelect = function (proxy) {
        if(!this.enabled || !proxy.item.visible)return;

        if(this.checkValidTouchCallFunc && !this.checkValidTouchCallFunc(proxy.index))return;

        if(this.curProxy == proxy){
            //proxy.onSelect &&
            cc.log("[" + this.id + "proxy] select " + proxy.index +  " some as last so  " + cc.director.getTotalFrames());
            return;
        }
        cc.log("[" + this.id + "proxy] onSelect " + proxy.index + "  "  + cc.director.getTotalFrames());
        if( this.curProxy != null){
            this.curProxy.onUnselect && this.curProxy.onUnselect();
        }

        this.curProxy = proxy;
        this.curProxy.onSelect && this.curProxy.onSelect();
    }


    component.Group.prototype.setDefaultIndex = function (index) {
        var proxy = this.proxys[index];
        if(proxy){
            cc.log("[" + this.id + "proxy] setDefaultIndex = " + index + " ,, " + (this.curProxy ? this.curProxy.index : -1));
            this.onSelect(proxy);
        }
    };

    component.Group.prototype.resetProxy = function (index) {
        var proxy = this.proxys[index];
        if(this.curProxy != proxy){
            this.curProxy && this.curProxy.onUnselect();
            this.curProxy = proxy;
        }
    }

    component.Group.prototype.clean = function () {
        this.curProxy = null;
        for(var  i = 0, len = this.proxys.length; i < len ; i++){
            this.proxys[i].clean();
            this.proxys[i] = null;
        }

        this.proxys = null;
        this.checkValidTouchCallFunc = null;
    };

    component.Group.prototype.currentIndex = function () {
        return this.curProxy ? this.curProxy.index :  -1;
    };

    component.Group.prototype.currentItem = function () {
        return this.curProxy ? this.curProxy.item :  null;
    };

    component.Group.prototype.dropSelect = function () {
        this.curProxy = null;
    };

    component.Group.create = function (musicType,checkCallFunc) {
        return new component.Group(musicType || 1,checkCallFunc);
    }


})(component);