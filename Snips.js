//version of underscore memoize that memoizes constructors correctly
_.memoize = function(func, hasher) {
  var memo = {};
  hasher || (hasher = _.identity);
  var memo = function() {
    var key = hasher.apply(this, arguments),
        construct = this instanceof memo;
    var returnable;
    if(_.has(memo, key)) {
      returnable = memo[key];
    } else {
      var result = func.apply(this, arguments);
      returnable = memo[key] = (construct ? this : result);
    }
    return returnable;
  };
  memo.prototype = func.prototype;
  return memo;
};







//execute functions in order define by place no matter in which order they are called
//var print = function(x) {console.log(x)};
//setQueue(1,print,2);
//--> nothing
//setQueue(0,print,4);
//--> 4
//--> 2
var setQueue = function(place, func) {
			var current = 0, queue = [];
			var helper = function(place, func, args) {
				if(place === current) {
					current++;
					func.apply(this, args);
					return true;
				}
				return false;
			};
			setQueue = function(place, func) {
				var args = _.chain(arguments).toArray().tail(2).value();
				if(helper(place, func, args)){
					_.each(queue, function(obj){
						helper(obj.place, obj.func, obj.args);
					}, this);
				} else {
					queue.push({place: place, func: func, args: args});
				}
			};
			return setQueue.apply(this, arguments);
		};

//backbone event sponge to allow later connect attempts to get already produced data
var sponge = function(object){
	var sponge = {}, eventSplitter = /\s+/, slice = Array.prototype.slice;
	var allFunc = function(eventName){
		var name, data;
		name = eventName;
		data = slice.call(arguments, 1);
		sponge[name] = data;
		console.log(arguments);
	};
	object.on("all", allFunc);
	var _origOn = object.on;
	object.on = _.wrap(_origOn, function(func){
		var events, args = slice.call(arguments, 1);
		func.apply(object, args);
		events = args[0].split(eventSplitter);
		while (event = events.shift()) {
			if(sponge[event]) {
				args[1].apply(args[2] || object, sponge[event]);
			}
		}
	});
	return {
		destroy: function() {
			object.on = _origOn;
			sponge = null;
			object.off("all", allFunc);
		}
	}
};

//logging timing stuff

logger = function(description, start) {
	var now = performance.now() - (start ? start : 0);
	var object = JSON.parse(localStorage.getItem("timings")) || {};
	var item = object[description];
	if(item) {
		var totalTime = item + now;
		object[description] =  totalTime;
		console.log(description + ": " + now);
	} else {
		object[description] = now;
		console.log(description + ": " + now);
	}
	localStorage.setItem("timings", JSON.stringify(object));
};

parseTimings = function() {
	var object = JSON.parse(localStorage.getItem("timings"));
	if(object) {
		var count = localStorage.getItem("reloadss") * 1;
		console.log("Reloads: " +  count);
		_.each(object, function(property, key){
			console.log("Cumulative " + key + ": " + (property / count));
		});
	}
};

reloader = function(count) {
	var item = (localStorage.getItem("reloadss") || 1) * 1;
	item++
	localStorage.setItem("reloadss", item);
	if(item < count) {
		location.reload();
	} else {
		parseTimings();
	}
};

clearStuff = function() {
	localStorage.setItem("reloadss", 0);
	localStorage.setItem("timings", null);
};

// extraction of backbone models attrs feature with change etc, can extend objects 
define(function(){
	return function(parent, extraName){
		extraName = extraName || "Attr";
		this.attributes = {};
		this._changes = {};
		this.changed = {};
		this._pending = {};
		this._previousAttributes = {};
		this._validate = function(){return true};
		this.get = _.bind(Backbone.Model.prototype.get, this);
		this.escape = _.bind(Backbone.Model.prototype.escape, this);
		this.set =_.bind(Backbone.Model.prototype.set, this);
		this.previous =_.bind(Backbone.Model.prototype.previous, this);
		this.previousAttributes =_.bind(Backbone.Model.prototype.previousAttributes, this);
		this.changedAttributes =_.bind(Backbone.Model.prototype.changedAttributes, this);
		this.hasChanged =_.bind(Backbone.Model.prototype.hasChanged, this);
		_.extend(this, Backbone.Events);

		if(parent) {
			this.on("all", function(event) {
				this.trigger.apply(parent, arguments);
			}, this);
		}

		var reveal = {
			"set": this.set,
			"get": this.get,
			escape: this.escape,
			previous: this.previous,
			previousAttributes: this.previousAttributes,
			changed: this.changedAttributes
		};

		return _.reduce(reveal, function(memo, fn, name) {
			memo[name + extraName] = fn;
			return memo;
		}, {})
	};
});
