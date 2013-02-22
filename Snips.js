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
		debugger;
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
