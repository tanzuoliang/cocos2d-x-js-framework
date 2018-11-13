var tz = tz || {};
tz.BaseScene = cc.Scene.extend({
	ctor : function (name) {
		this._super();
		this._name = name || "undefined";
	},

	getName : function () {
		this._name;
	}
});