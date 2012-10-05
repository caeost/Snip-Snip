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
