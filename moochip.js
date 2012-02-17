function Pin(component, name)
{
	return {
		name: name,
		component: component,
		
		connections: [],

		src: null,
		i: null,
		u: null,

		connect: function(pin) {
			this.connections.push(pin);
			pin.connections.push(this);
			return this;
		}
	};
}

function Component(type, name)
{
	return {
		pins: [],
		
		type: type,
		name: name || 'unnamed_component',

		invoke: function(pin, I, U) {
		},
		
		conduction: function(pinA, pinB) {
		},

		pin: function(name) {
			for (var i = 0; i < this.pins.length; i++) {
				if (this.pins[i].name == name)
					return this.pins[i];
			}

			return null;
		}
	}
}

function Scheme() {
	return {
		components: [],
		
		add: function(component) {
			this.components.push(component);
		},
		
		component: function(name, type) {
			for (var i = 0; i < this.components.length; i++) {
				var c = this.components[i];
				
				if (this.name && this.type) {
					if (c.name == name && c.type == type)
						return c;
				} else
				if (this.type) {
					if (c.type == type)
						return c;
				} else {
					if (c.name == name)
						return c;
				}
			}
		},
		
		run: function(src) {
			var q = [].concat(src.pin('positive').connections), stopFlag = 0, controlFlag = src.pin('negative').connections.length;
			
			for (var i = 0; i < q.length; i++) {
				q[i].i = src.pin('positive').i;
				q[i].u = src.pin('positive').u;
			}
			
			while (q.length > 0) {
				if (stopFlag >= controlFlag) {
					console.log('Stopping forward iterations');
					console.log('Queue left: ', q);
					break;
				}
				
				for (var i = 0; i < q.length; i++) {
					if (q[i] == src.pin('negative'))
						stopFlag++;
				}
				
				var p = q.shift();
				
				var isSrcNegativeReachable = function(pin, src) {
					var q = [ pin ], v = [];
					
					while (q.length > 0) {
						var p = q.shift();
						
						if (v.indexOf(p) > -1 || p == src.pin('positive'))
							continue;
						
						if (p == src.pin('negative')) {
							return true;
						}
						
						v.push(p);
						
						for (var i = 0; i < p.connections.length; i++) {
							var p2 = p.connections[i];
							
							if (v.indexOf(p2) < 0 && p != p2)
								q = q.concat(p2);
						}
						
						for (var i = 0; i < p.component.pins.length; i++) {
							var p2 = p.component.pins[i];
							
							if (v.indexOf(p2) < 0 && p != p2 && p.component.conduction(p, p2))
								q = q.concat(p2.connections);
						}
					}
					
					return false;
				}
				
				for (var i = 0; i < p.component.pins.length; i++) {
					var p2 = p.component.pins[i];
					
					if (isSrcNegativeReachable(p2, src))
						p2.src = 'negative';
				}
				
				p.component.invoke(p, p.i, p.u);
				
				for (var i = 0; i < p.component.pins.length; i++) {
					var p2 = p.component.pins[i];
					
					if (p2 != p && p2.u && p2.i)
						for (var t = 0; t < p2.connections.length; t++) {
							p2.connections[t].i = p2.i;
							p2.connections[t].u = p2.u;
							q.push(p2.connections[t]);
						}
				}
			}
		}
	}
}