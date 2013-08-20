// _.extend(model1, limpit); model1.attach(model2); model2.set("test","hi", {silent:true}); model1.get("test")  => "hi"

var limpit = function() {
	var mapAdd = function(point, from, attrs) {
		var cid = from.cid;
		return _.defaults(point._limpit, _.reduce(attrs, function(memo, value, key){
			memo[key] = cid;
			return memo;
		}, {}));
	};

	var mapRemove = function(point, from, attrs) {
		var limpit = point._limpit,
			cid = from.cid;
		for(var key in attrs) {
			if(attrs.hasOwnProperty(key)) {
				if(limpit[key] = cid) {
					delete limpit[key];
				}
			}
		}
	};

	return {
		attach: function(model) {
			var that = this;
			if(!this._limpit) {
				this._limpitList = {};
				var limpit = this._limpit = {};

				mapAdd(this, {cid: null}, this.toJSON());

				var oldT = this._validate;
				this._validate = function(attrs, options) {
					var temp = {},
						toIgnore = {};
					_.each(attrs, function(value, key){
						var cid = limpit[key];
						if(cid) {
							temp[cid] = temp[cid] || {};
							temp[cid][key] = value;
						} else {
							toIgnore[key] = null;
						}
					});
					mapAdd(this, {cid: null}, toIgnore);
					_.each(temp, function(foundAttrs, cid) {
						this._limpitList[cid].set(foundAttrs, _.extend({_limpitStop: true}, options));
					}, this);
					return oldT.apply(this, arguments);
				}
			}

			var attributes = model.toJSON();
			mapAdd(this, model, attributes);
			this.set(attributes);

			this._limpitList[model.cid] = model;

			var oldM = model.__validate = model._validate;
			model._validate = function(attrs, options) {
				var unset;

				unset = options.unset;

				unset ? mapRemove(that, model, attrs) : mapAdd(that, model, attrs);

				if(!options._limpitStop) {
					that.set(attrs, options);
				}

				return oldM.apply(model, arguments);
			}
		},
		detach: function(model) {
			var modelCid = model.cid;

			delete this._limpitList[modelCid];

			mapRemove(this, model, model.toJSON());

			model._validate = model.__validate;
		}
	}
}();
