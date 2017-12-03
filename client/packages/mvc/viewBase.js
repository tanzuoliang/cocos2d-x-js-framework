var tianyi = tianyi || {};

/**
 * 类属性
 * RESOURCE_FILENAME : null,
   RESOURCE_BINDING : null,
 *  Example: RESOURCE_FILENAME = "main.json"
 *  RESOURCE_BINDING = {"nameTf":
 *  						{
 *  							"varname":"",//可选
 *  							"events":{"onClick":"methodName,"onTouch":true}//
 *  				  }
 *
 */
tianyi.ViewBase = cc.Node.extend({
	lastClickTime : -1,
	VALID_CLICK_DETAL : 500,

	ctor : function (name) {
		this._super();
		this._name = name;

		defineProperty(this,"dispatcher",tianyi.events.IEvent.new());

		if(this.constructor.RESOURCE_FILENAME != null){
			this.createResourceNode(this.RESOURCE_FILENAME);
		}

		if(this.constructor.RESOURCE_BINDING != null){
			this.createResourceBinding(this.RESOURCE_BINDING);
		}

		this.onCreate();
	},

	onCreate : function () {

	},

	removeSelf : function () {
		this.removeFromParent();

	},

	/**
	 ** 获取显示名
	 */
	getName : function () {
		return this._name;
	},

	getResourceNode : function () {
		this._resourceNode;
	},

	getWidth : function () {
		return this._contentSize.width;
	},

	getHeight : function () {
		return this._contentSize.height;
	},

	/**
	 **是否被按住
	 */
	getIsTouching : function () {
		return this._isTouching;
	},

	createResourceNode : function(resourceFilename){
		if(this._resourceNode){
			this._resourceNode.removeFromParent();
			this._resourceNode = null;
		}

		this._resourceNode = ccs.load($rootName).node;
		this.addChilde(this._resourceNode);
		this._contentSize = this._resourceNode.getContentSize();
		this.setContentSize(this._contentSize);
	},

	createResourceBinding : function (binding) {
		cc.assert(this._resourceNode,"ViewBase.createResourceBinding - not load resource node");
		for(var nodeName in binding){
			var node = ccui.helper.seekWidgetByName(this._resourceNode,nodeName);
			cc.assert(node,"ViewBase.createResourceBinding - can not find node by the name with " + nodeName);
			var nodeBinding = binding[nodeName];
			if(nodeBinding.hasOwnProperty("varname")){
				this[nodeBinding.varname] = node;
			}
			else{
				this[nodeName] = node;
			}

			//配置事件
			if(nodeBinding.hasOwnProperty("events")){
				var events = nodeBinding.events;

                for(var key in event){
                    if(key == "onClick"){
                        //已经配了回调
                        if(event[key]){
                            node.addClickEventListener(this[event[key]].bind(this,node));
                        }//用默认回调
                        else{
                            node.addClickEventListener(this.onClick.bind(this,node));
                        }
                    }
                    else if(key == "onTouch"){
                        node.addTouchEventListener(this.onTouch.bind(this));
                    }
                }
			}

		}
	},

	/**
	 *
	 *	是否有效点击，避免连点
	 */
	isValidClick : function (node) {
		var now = Date.now();

		if(node.lastClickTime > 0){

			var last = node.lastClickTime;
			if((now - last) < this.VALID_CLICK_DETAL){
				return false;
			}
		}

		node.lastClickTime = now;

		return true;
	},

	onClick : function (node) {

	},

	onTouch : function (node,eventType) {
		switch (eventType) {
			case ccui.Widget.TOUCH_BEGAN:
				this.onTouchBegan(node);
				this._isTouching = true;
				break;

			case ccui.Widget.TOUCH_MOVED:
				this.onTouchMove(node);
				break

			case ccui.Widget.TOUCH_ENDED:
				this.onTouchEnded(node);
				this._isTouching = false;
				break

			case ccui.Widget.TOUCH_CANCELED:
				this.onTouchCanceled(node);
				this._isTouching = false;
				break
		}
	},

	onTouchBegan : function (node) {

	},

	onTouchMove : function (node) {

	},

	onTouchEnded : function (node) {

	},

	onTouchCanceled : function (node) {

	},

	/**
	 *
	 *
	 */
	showWithScene : function () {
		var scene = new tianyi.BaseScene();
		scene.addChild(this);
		cc.director.replaceScene(scene);
	},
	//------------------ 焦点事件 ------------------

	onFocusIn : function () {

	},

	onFocusOut : function () {

	},

	//------------------ 事件 ---------------------------

});



//---------------------------- 动画对象 ----------------------
tianyi.TYAnimatorView = tianyi.ViewBase.extend({

	_animatorType : null,

	ctor : function (name) {
		this._super(name);
	},

	/**
	 * 显示动画
	 * @param type
	 */
	showAnimator : function (type) {

	}
});

//----------------------------------  panel ------------------------
tianyi.TYPanel = tianyi.TYAnimatorView.extend({

	ctor : function (name) {
		this._super(name);
	},

});


//----------------------------------  window -------------------------
tianyi.TYWindow = tianyi.TYAnimatorView.extend({
	ctor : function (name) {
		this._super(name);
	}
});


//-----------------------------