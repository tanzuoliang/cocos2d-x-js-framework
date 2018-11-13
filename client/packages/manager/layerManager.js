var tz = tz || {};

tz.LayerManager = {
	layerList : [],
	curView : null,

	/**
	 *
	 * @param view 层对象
	 * @param addType 添加方式 （独占  共享）
	 */
	addLayer : function (view,addType) {
		switch (addType){
			case tz.CONST.LAYER_ADD_TYPE.ALONE:
				this.removeOldLayers();
				break;
			case tz.CONST.LAYER_ADD_TYPE.SHARE:
				this.onFocusOut();
				break;
		}
		this.layerList[this.layerList.length] = view;
		this.curView = view;
		this.onFocusIn();
	},

	/**
	 * 删除面板
	 * @param view 要删除的对象  要的当前最后一个作下比较 看是不是自己
	 */
	removeLayer : function (view) {
		var len = this.layerList.length;
		if(len > 1){
			if(view && this.curView && view == this.curView){
				this.onFocusOut();
				this.curView.removeSelf();
			}
			this.layerList.pop();
			this.curView = this.layerList[len - 1];
			this.onFocusIn();
		}
	},

	/**
	 * 删除当前最后一个层对象
	 */
	removeLastView : function () {
		if(this.curView){
			this.curView.onFocusOut();
			this.curView.removeSelf();
			this.curView = null;
			this.layerList.pop();

			if(this.layerList.length > 0){
				this.curView = this.layerList[this.layerList.length - 1];
			}
		}
	},

	/**
	 * 	删除所有的层
	 */
	removeOldLayers : function () {
		var len = this.layerList.length;
		if(len > 0){
			for(var i = 0; i < len;i++){
				this.layerList[i].removeSelf();
			}
		}

		this.layerList.length = 0;
		this.curView = null;
	},

	onFocusIn : function () {
		this.curView && this.curView.onFocusIn();
	},

	onFocusOut : function () {
		this.curView && this.curView.onFocusOut();
	}
};