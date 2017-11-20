var tianyi = tianyi || {};
tianyi.BaseScene = cc.Scene.extend({
	ctor : function (name) {
		this._super();
		this._name = name;
	},

	getName : function () {
		this._name;
	}
});