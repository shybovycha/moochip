function MooChip() {}

MooChip.paper = null;
MooChip.scheme = null;
MooChip.stopRunning = false;
MooChip.gridSize = 25;
MooChip.invokeGlowColor = '#3AF7EE';

MooChip.distance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

Raphael.st.getBBox = function() {
	if ((!this.length || this.length <= 0)) {
		return;
	}
	
	var _bb = this[0].getBBox();
	var bb  = { x1: _bb.x, y1: _bb.y, x2: _bb.x, y2: _bb.y };

	this.forEach(function(entity) { 
		var e = entity.getBBox(); 
		
		if (e.x < bb.x1) 
			bb.x1 = e.x; 
				
		if (e.y < bb.y1) 
			bb.y1 = e.y; 
				
		if ((e.x + e.width) > bb.x2) 
			bb.x2 = e.x + e.width; 
				
		if ((e.y + e.height) > bb.y2) 
			bb.y2 = e.y + e.height; 
	});
	
	return { x: bb.x1, y: bb.y1, width: bb.x2 - bb.x1, height: bb.y2 - bb.y1};
};

Raphael.st.rotate = function(degree) {
	var bb = this.getBBox(), cx = bb.x + (bb.width / 2.0), cy = bb.y + (bb.height / 2.0);

	this.forEach(function(entity) {
		entity.transform('r' + degree + ',' + cx + ',' + cy + '...');
	});
	
	if (this.entity) {
		MooChip.scheme.updateConnectionLines(this.entity.component);
	}
};

Raphael.st.glow = function(attrs) {
	this.forEach(function(entity) {
		if (!entity.glowEntity)
			entity.glowEntity = entity.glow(attrs);
	});
};

Raphael.st.unglow = function() {
	this.forEach(function(entity) {
		if (entity.glowEntity) {
			entity.glowEntity.remove();
			entity.glowEntity = null;
		}
	});
};

Raphael.el.getPos = function() {
	var _bb = this.getBBox();
	
	return { x: _bb.x + (_bb.width / 2.0), y: _bb.y + (_bb.height / 2.0) };
};

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
		
		var line = MooChip.scheme.connectionLine(this.entity, pin.entity);
		
		if (this.entity && pin.entity && !line) {
			var p1 = this.entity.getPos(), p2 = pin.entity.getPos();
			var line = MooChip.paper.path('M' + p1.x + ',' + p1.y + 'L' + p2.x + ',' + p2.y);
			
			line.pinA = this.entity; 
			line.pinB = pin.entity;
			
			MooChip.scheme.connectionLines.push(line);
		} else {
			console.log('Could not connect', [this, pin], 'because of', line);
			// opera.postError('Could not connect', [this, pin], 'because of', line);
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
		this.entity.pin = this;
		
		var entity = this.entity,
		
		move = function(dx, dy) {
			var ox = this.connectionLine.ox, oy = this.connectionLine.oy;
			
			this.connectionLine.attr({'path': 'M' + ox + ',' + oy + 'L' + (ox + dx) + ',' + (oy + dy)});
		}, 
		
		start = function(_x, _y, evt) {
			var _p = this.getPos(), x = _p.x, y = _p.y;
			
			if (!this.connectionLine)
				this.connectionLine = MooChip.paper.path('M' + x + ',' + y + 'L' + x + ',' + y).attr({'stroke': '#10097B', 'stroke-width': 3}); else
					this.connectionLine.attr({'path': 'M' + x + ',' + y + 'L' + x + ',' + y});
					
			this.connectionLine.ox = x;
			this.connectionLine.oy = y;
		},
		
		end = function(evt) {
			MooChip.paper.renderfix();
			var _components = MooChip.scheme.components, target = false, x1 = evt.layerX | evt.clientX, y1 = evt.layerY | evt.clientY;
			
			// check if selected component is a wire
			
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
				target.connect(this.pin);
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
	
	this.rotate = function(degree) {
		this.entity.rotate(degree);
		this.pinEntity.rotate(degree);
		
		if (this.entity.selectionRect)
			this.entity.selectionRect.rotate(degree);
		
		MooChip.scheme.updateConnectionLines(this);
	};
	
	this.updateDragFunctions = function() {
		var entity = this.entity, pinEntity = this.pinEntity, name = this.name,
		
		start = function() {
			entity.oBB = entity.getBBox();
			pinEntity.oBB = pinEntity.getBBox();
		},
		
		move = function(dx, dy) {
			var bb = entity.getBBox(), bb2 = pinEntity.getBBox();
			entity.transform('t' + (entity.oBB.x - bb.x + dx) + ',' + (entity.oBB.y - bb.y + dy) + '...');
			pinEntity.transform('t' + (entity.oBB.x - bb.x + dx) + ',' + (entity.oBB.y - bb.y + dy) + '...');
			
			if (entity.selectionRect)
				entity.selectionRect.transform('t' + (entity.oBB.x - bb.x + dx) + ',' + (entity.oBB.y - bb.y + dy) + '...');
				
			MooChip.scheme.updateConnectionLines(entity.component);
		},
		
		up = function() {
			console.log(name, ' dropped!');
			// opera.postError(name, ' dropped!');
		};
		
		this.entity.drag(move, start, up);
		
		this.pinEntity.mouseover(function(){ if (!this.g) this.g = this.glow({'color':'#0101DF'}); }).mouseout(function(){ if (this.g) { this.g.remove(); this.g = null; } });
	};
}

function Scheme() {
	this.components = [];
	this.connectionLines = [];
	this.src = null;
	this.queue = [];
	this.selectedComponent = null;
	
	MooChip.paper.canvas.onclick = function(e) {
		var components = MooChip.scheme.components, entity = MooChip.paper.getElementByPoint(e.clientX, e.clientY);
		
		for (var i = 0; i < components.length; i++) {
			if (components[i].entity.selectionRect) {
				components[i].entity.selectionRect.remove();
				components[i].entity.selectionRect = null;
			}
		}
		
		for (var i = 0; i < components.length; i++) {
			for (var t = 0; t < components[i].entity.length; t++) {
				if (components[i].entity[t] == entity) {
					MooChip.scheme.selectedComponent = components[i];
					
					var _bb = MooChip.scheme.selectedComponent.entity.getBBox();
					MooChip.scheme.selectedComponent.entity.selectionRect = MooChip.paper.set();
					MooChip.scheme.selectedComponent.entity.selectionRect.push(MooChip.paper.rect(_bb.x, _bb.y, _bb.width, _bb.height).attr({fill: "none", stroke: "#666", "stroke-dasharray": "- "}));
					
					return;
				}
			}
		}
		
		MooChip.scheme.selectedComponent = null;
	};
	
	this.connectionLine = function(pinA, pinB) {
		var lines = this.connectionLines, res = null;
			
		for (var i = 0; i < lines.length; i++) {
			if (pinA && !pinB && (lines[i].pinA == pinA || lines[i].pinB == pinA)) {
				if (!res)
					res = [];
					
				res.push(lines[i]);
			} else
			if (pinA && pinB && ((lines[i].pinA == pinA && lines[i].pinB == pinB) || (lines[i].pinA == pinB && lines[i].pinB == pinA))) {
				res = lines[i];
				break;
			}
		}
		
		return res;
	};
	
	this.updateConnectionLines = function(component) {
		var pins = component.pins;
		
		if (!pins)
			return;
		
		for (var i = 0; i < pins.length; i++) {
			var lines = this.connectionLine(pins[i].entity);
			
			if (!lines || !lines.length)
				continue;

			for (var t = 0; t < lines.length; t++) {
				var line = lines[t], p1 = line.pinA.getPos(), p2 = line.pinB.getPos();
				
				line.attr({'path': 'M' + p1.x + ',' + p1.y + 'L' + p2.x + ',' + p2.y});
			}
		}
	}
	
	this.remove = function(component) {
		if (component.entity.selectionRect)
			component.entity.selectionRect.remove();
			
		component.entity.unglow();
		component.pinEntity.unglow();
			
		if (component.entity)
			component.entity.remove();
			
		if (component.pinEntity)
			component.pinEntity.remove();
			
		for (var i = 0; i < component.pins.length; i++) {
			var pin = component.pins[i];
			
			for (var t = 0; t < pin.connections.length; t++) {
				for (var j = 0; j < pin.connections[t].connections.length; j++) {
					if (pin.connections[t].connections[j] == pin) {
						pin.connections[t].connections = pin.connections[t].connections.slice(0, j).concat(pin.connections[t].connections.slice(j + 1));
						t = 0;
						break;
					}
				}
			}
			
			var lines = this.connectionLines;
			
			for (var t = 0; t < lines.length; t++) {
				var line = lines[t];
				
				if (line.pinA == pin.entity || line.pinB == pin.entity) {
					line.remove();
					lines = lines.slice(0, t).concat(lines.slice(t + 1));
					t = 0;
				}
			}
		}
		
		for (var i = 0; i < this.components.length; i++) {
			if (this.components[i] == component) {
				this.components = this.components.slice(0, i).concat(this.components.slice(i + 1));
				i = 0;
			}
		}
	};
	
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
	
	this.findDCSource = function() {
		if (this.src)
			return;

		for (var i = 0; i < this.components.length; i++) {
			if (this.components[i].type == 'dc_source') {
				this.src = this.components[i];
				break;
			}
		}
	}
	
	this.resetComponentStates = function() {
		MooChip.stopRunning = true;
		
		for (var i = 0; i < this.components.length; i++) {
			var component = this.components[i];
			
			if (component.uninvoke)
				component.uninvoke();
			
			for (var t = 0; t < component.pins.length; t++) {
				component.pins[t].i = null;
				component.pins[t].u = null;
			}
		}
		
		this.queue = [];
	}
	
	this.isSrcNegativeReachable = function(pin, src) {
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
	
	this.singleStep = function() {
		if (!this.src)
			this.findDCSource();
		
		if (!this.src) {
			console.log('Could not find any DC source. Stopping.');
			// opera.postError('Could not find any DC source. Stopping.');
			return;
		}
		
		if (!this.queue || !this.queue.length) {
			var _tmp = [];
			
			this.src.invoke(this.src.pin('negative'));
			
			_tmp = (this.src.pin('positive').connections);
			
			for (var i = 0; i < _tmp.length; i++) {
				_tmp[i].i = this.src.pin('positive').i;
				_tmp[i].u = this.src.pin('positive').u;
			}
			
			this.queue = [ _tmp ];
		}
		
		var _it = this.queue.shift(), _newIt = [];
		
		if (!_it || !_it.length)
			return;
		
		for (var ze = 0; ze < _it.length; ze++) {
			var p = _it[ze];
			
			if (!p || !p.component) {
				console.log('Pin is invalid', p);
				// opera.postError('Pin is invalid', p);
				continue;
			}
			
			for (var i = 0; i < p.component.pins.length; i++) {
				var p2 = p.component.pins[i];
				
				if (this.isSrcNegativeReachable(p2, this.src))
					p2.src = 'negative';
			}
			
			p.component.invoke(p, p.i, p.u);
			
			for (var i = 0; i < p.component.pins.length; i++) {
				var p2 = p.component.pins[i];
				
				if (p2.u && p2.i)
					for (var t = 0; t < p2.connections.length; t++) {
						p2.connections[t].i = p2.i;
						p2.connections[t].u = p2.u;
						_newIt.push(p2.connections[t]);
					}
			}
		}
		
		for (var i = 0; i < _newIt.length; i++) {
			for (var t = 0; t < _newIt.length; t++) {
				if (_newIt[i] == _newIt[t] && i != t) {
					_newIt = _newIt.slice(0, t).concat(_newIt.slice(t + 1));
				}
			}
		}
		
		this.queue.push(_newIt);
	}
	
	this.fullCircuitStep = function() {
		this.findDCSource();
		
		if (!this.src) {
			console.log('Could not find any DC source. Stopping.');
			// opera.postError('Could not find any DC source. Stopping.');
			return;
		}
		
		var stopFlag = 0, controlFlag = this.src.pin('negative').connections.length;
		
		var _tmp = [];
		
		this.src.invoke(this.src.pin('negative'));
		
		_tmp = (this.src.pin('positive').connections);
		
		for (var i = 0; i < _tmp.length; i++) {
			_tmp[i].i = this.src.pin('positive').i;
			_tmp[i].u = this.src.pin('positive').u;
		}
		
		this.queue = [ _tmp ];
		
		var negativeSrcPin = this.src.pin('negative'), loopControlFl = 0;
		
		while (this.queue.length > 0) {
			if (stopFlag >= controlFlag) {
				console.log('Stopping forward iterations');
				console.log('Queue left: ', this.queue);
				return;
			}
			
			for (var i = 0; i < this.queue.length; i++) {
				for (var t = 0; t < this.queue[i].length; t++) {
					if (this.queue[i][t] == negativeSrcPin)
					stopFlag++;
				}
			}
			
			loopControlFl = 0;
			
			for (var i = 0; i < this.components.length; i++) {
				var component = this.components[i];
				
				for (var t = 0; t < component.pins.length; t++) {
					var pin = component.pins[t];
					
					if (!pin.i || !pin.u)
						loopControlFl++;
				}
			}
						
			this.singleStep();
			
			var loopControlFlCheck = 0;
			
			for (var i = 0; i < this.components.length; i++) {
				var component = this.components[i];
				
				for (var t = 0; t < component.pins.length; t++) {
					var pin = component.pins[t];
					
					if (!pin.i || !pin.u)
						loopControlFlCheck++;
				}
			}
			
			if (loopControlFl == loopControlFlCheck) {
				console.log('No component changes - stopping forward iterations');
				console.log('Queue left: ', this.queue);
				return;
			}
		}
	}
	
	this.run = function() {
		MooChip.stopRunning = false;
		
		this.findDCSource();
		
		if (!this.src) {
			console.log('Could not find any DC source. Stopping.');
			return;
		}
		
		this.queue = [].concat(this.src.pin('positive').connections);
		
		function _itStep() {
			MooChip.scheme.fullCircuitStep();
			
			if (!MooChip.stopRunning)
				setTimeout(_itStep, 50);
		}
		
		_itStep();
	};
}
