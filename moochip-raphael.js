function MooChip() {}

MooChip.paper = null;
MooChip.scheme = null;
MooChip.gridSize = 25;

MooChip.distance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

Raphael.el.getPos = function() {
	var x = this.ox || 0, y = this.oy || 0, tr = this.transform();

	for (var j = 0; j < tr.length; j++) {
		if (tr[j][0] == 't') {
			x += tr[j][1];
			y += tr[j][2];
		}
	}
	
	return { 'x': x, 'y': y };
}

function Pin(component, name)
{
	this.name = name;
	this.component = component;

	this.connections = [];

	this.src = null;
	this.i = null;
	this.u = null;
	
	this.entity = null;
	this.connectionLine = null;
	
	this.connect = function(pin) {
		this.connections.push(pin);
		pin.connections.push(this);
		
		if (this.entity && pin.entity && !MooChip.scheme.connectionLine(this.entity, pin.entity)) {
			var p1 = this.entity.getPos(), p2 = pin.entity.getPos();
			var line = MooChip.paper.path('M' + p1.x + ',' + p1.y + 'L' + p2.x + ',' + p2.y);
			
			line.pinA = this.entity; 
			line.pinB = pin.entity;
			
			MooChip.scheme.connectionLines.push(line);
		}

		return this;
	};
	
	this.createEntity = function(x, y, r) {
		if (!x || !y)
			return;
			
		if (!r)
			r = 5;
			
		this.entity = MooChip.paper.circle(x, y, r).attr({'fill': '#A13E3E'});
		this.entity.ox = x; this.entity.oy = y;
		
		var entity = this.entity,
		
		move = function(dx, dy) {
			var ox = this.connectionLine.ox, oy = this.connectionLine.oy;
			
			this.connectionLine.attr({'path': 'M' + ox + ',' + oy + 'L' + (ox + dx) + ',' + (oy + dy)});
		}, 
		
		start = function(x, y) {
			if (!this.connectionLine)
				this.connectionLine = MooChip.paper.path('M' + x + ',' + y + 'L' + x + ',' + y).attr({'stroke': '#10097B', 'stroke-width': 3}); else
					this.connectionLine.attr({'path': 'M' + x + ',' + y + 'L' + x + ',' + y});
					
			this.connectionLine.ox = x;
			this.connectionLine.oy = y;
		},
		
		end = function(evt) {
			var _components = MooChip.scheme.components, target = false, x1 = evt.clientX, y1 = evt.clientY;
			
			for (var i = 0; i < _components.length; i++) {
				var _pins = _components[i].pins;
				
				for (var t = 0; t < _pins.length; t++) {
					if (!_pins[t].entity || _pins[t].entity == entity) {
						continue;
					}
					
					var _p = _pins[t].entity.getPos(), x2 = _p.x, y2 = _p.y, d = MooChip.distance(x1, y1, x2, y2);

					if (d < 15) {
						target = _pins[t];
						break;
					}
				}
				
				if (target)
					break;
			}
			
			this.connectionLine.remove();
			this.connectionLine = null;
			
			if (target) {
				console.log('Connection between', [target, this], 'could be established!');
			}
		};
		
		this.entity.drag(move, start, end);
	};
}

function Component(type, name)
{
	this.pins = [];
	
	this.type = type;
	this.name = name || 'unnamed_component';

	this.invoke = function(pin, I, U) {
	};
	
	this.conduction = function(pinA, pinB) {
	};

	this.pin = function(name) {
		for (var i = 0; i < this.pins.length; i++) {
			if (this.pins[i].name == name)
				return this.pins[i];
		}

		return null;
	};
	
	this.entity = null;
	this.pinEntity = null;
}

function Scheme() {
	this.components = [];
	this.connectionLines = [];
	
	this.connectionLine = function(pinA, pinB) {
		var lines = this.connectionLines;
			
		for (var i = 0; i < lines.length; i++) {
			if ((pinA && !pinB && (lines[i].pinA == pinA || lines[i].pinB == pinA)) || 
				(pinB && (lines[i].pinA == pinA || lines[i].pinB == pinB || lines[i].pinA == pinB || lines[i].pinB == pinA))) 
			{
				return lines[i];
			}
		}
		
		return null;
	};
	
	this.updateConnectionLines = function(component) {
		var pins = component.pins;
		
		if (!pins)
			return;
		
		for (var i = 0; i < pins.length; i++) {
			var line = this.connectionLine(pins[i].entity);
			
			if (!line)
				continue;
				
			var p1 = line.pinA.getPos(), p2 = line.pinB.getPos();
			
			line.attr({'path': 'M' + p1.x + ',' + p1.y + 'L' + p2.x + ',' + p2.y});
		}
	}
	
	this.add = function(component) {
		this.components.push(component);
	};
	
	this.component = function(name, type) {
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
	};
	
	this.run = function(src) {
		var q = [].concat(src.pin('positive').connections), stopFlag = 0, controlFlag = src.pin('negative').connections.length;
		
		src.invoke(src.pin('negative'));
		
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
	};
}