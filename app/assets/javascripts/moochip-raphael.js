function MooChip() {}

MooChip.paper = null;
MooChip.scheme = null;
MooChip.stopRunning = false;
MooChip.gridSize = 25;
MooChip.invokeGlowColor = '#3AF7EE';
MooChip.updatePinMeter = null;

// set to 'true' for some speeding up!
MooChip.lightMode = false;

Raphael.getMousePos = function(event) {
	var offset = { 
			top: event.target.offsetTop + (parseFloat(event.target.style.marginTop) || 0), 
			left: event.target.offsetLeft + (parseFloat(event.target.style.marginLeft) || 0) 
		};
	
	return { x: event.layerX || (event.pageX - offset.left), y: event.layerY || (event.pageY - offset.top) };
};

MooChip.distance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

Raphael.doLinesIntersect = function(path1, path2) {
	var points = [ 
			{ x: path1.x1, y: path1.y1 },
			{ x: path1.x2, y: path1.y2 },
			{ x: path2.x1, y: path2.y1 },
			{ x: path2.x2, y: path2.y2 },
		],
		a = { x: Math.abs(points[1].x - points[0].x), y: Math.abs(points[1].y - points[0].y) },
		b = { x: Math.abs(points[3].x - points[2].x), y: Math.abs(points[3].y - points[2].y) },
		c = { x: Math.abs(points[2].x - points[1].x), y: Math.abs(points[2].y - points[1].y) },
		d = { x: Math.abs(points[3].x - points[0].x), y: Math.abs(points[3].y - points[0].y) },
		s1 = { x: a.x + b.x + c.x, y: a.y + b.y + c.y };
	
	//console.log(points, s1, d);
	
	if (s1.x == d.x && s1.y == d.y)
		return 0; else 
			return Math.sqrt(Math.pow(c.x, 2) + Math.pow(c.y, 2));
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
			line.toBack();
			line.attr({ 'stroke-width': 3, 'stroke': '#2E2E2E' });
			
			line.updatePoints = function() {
				MooChip.scheme.unselectConnectionLine(this);
				
				var _p1 = this.points[0], _p2 = { x: this.pinA.attr('x'), y: this.pinA.attr('y') }, _p3 = { x: this.pinB.attr('x'), y: this.pinB.attr('y') };
				
				this.pointEntities = [];
				
				if (this.points) {
					for (var i = 1; i < this.points.length - 1; i++) {
						var p = this.points[i],
							r = MooChip.paper.rect(p.x - 4, p.y - 4, 8, 8);
							
						r.attr({ 'fill': '#8A0829', 'stroke': '#8A0829' });
						r.connectionLine = this;
						r.pointIndex = i;
						r.ox = r.attr('x');
						r.oy = r.attr('y');
						
						var start = function(x, y) {
								this.ox = this.attr('x'); this.oy = this.attr('y'); this.points = this.connectionLine.points;
							},
						
							move = function(_dx, _dy, _x, _y, _e) {
								var bbox = this.getBBox(), x = this.ox + _dx, y = this.oy + _dy;
								this.attr({ 'x': x, 'y': y });
								this.connectionLine.points[this.pointIndex] = { 'x': x + (bbox.width / 2), 'y': y + (bbox.height / 2) };
							},
							
							end = function(e) {
								MooChip.scheme.updateConnectionLines();
							};
						
						r.drag(move, start, end);
						
						r.dblclick(function() {
							var points = this.connectionLine.points, min = -1, p = this.getPos();
							
							for (var i = 0; i < points.length; i++) {
								if (points[i].x == p.x && points[i].y == p.y) {
									min = i;
									break;
								}
							}
							
							if (min < 0 || min > points.length) {
								console.log('Could not remove point');
								
								return;
							}
							
							this.connectionLine.points = points.slice(0, min).concat(points.slice(min + 1));
							
							this.remove();
							
							MooChip.scheme.updateConnectionLines();
						});
						
						this.pointEntities.push(r);
					}
				} else {
					console.log('There are no points');
				}
			};
			
			line.click(function() {
				this.updatePoints();
			});
			
			line.dblclick(function(_e) {
				var _pos = Raphael.getMousePos(_e), p = { 'x': _pos.x, 'y': _pos.y }, min = -1;
				
				for (var i = 1; i < this.points.length; i++) {
					var p2 = this.points[i], p3 = this.points[i - 1],
						d_a_c = MooChip.distance(p.x, p.y, p2.x, p2.y),
						d_b_c = MooChip.distance(p.x, p.y, p3.x, p3.y),
						d_a_b = MooChip.distance(p2.x, p2.y, p3.x, p3.y);
						
					if (Math.abs(d_a_b - (d_a_c + d_b_c)) <= 3) {
						min = i;
						
						break;
					}
				}
				
				if (min < 0 || min > this.points.length) {
					console.log('Could not add point');
					
					return;
				}
				
				this.points = this.points.slice(0, min).concat([ p ], this.points.slice(min));

				this.updatePoints();
				
				MooChip.scheme.updateConnectionLines();
			});
			
			MooChip.scheme.connectionLines.push(line);
			MooChip.scheme.updateConnectionLines();
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
			this.connectionLine.x = ox + dx;
			this.connectionLine.y = oy + dy;
		}, 
		
		start = function(_x, _y, evt) {
			var _p = this.getPos(), x = _p.x, y = _p.y;
			
			if (!this.connectionLine)
				this.connectionLine = MooChip.paper.path('M' + x + ',' + y + 'L' + x + ',' + y).attr({'stroke': '#10097B', 'stroke-width': 3}); else
					this.connectionLine.attr({'path': 'M' + x + ',' + y + 'L' + x + ',' + y});
					
			this.connectionLine.attr({ 'stroke-dasharray': '-' });
			this.connectionLine.ox = x;
			this.connectionLine.oy = y;
			this.connectionTarget = null;
		},
		
		end = function(evt) {
			if (this.connectionTarget && this.connectionLine) {
				var _p1 = this.connectionTarget.entity.getPos(), d = MooChip.distance(_p1.x, _p1.y, this.connectionLine.x, this.connectionLine.y);
				
				if (d < 15) {
					this.connectionTarget.connect(this.pin);
				}
			}
			
			if (this.connectionLine) {
				this.connectionLine.remove();
				this.connectionLine = null;
			}
		},
		
		dragOver = function(otherEntity) {
			if (!otherEntity.pin || !otherEntity.pin.component) {
				return;
			}
			
			this.connectionTarget = otherEntity.pin;
		};
		
		this.entity.drag(move, start, end);
		this.entity.onDragOver(dragOver);
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
			
			entity.attr({ 'opacity': 0.25});
			pinEntity.attr({ 'opacity': 0.25});
			
			if (MooChip.lightMode)
				MooChip.scheme.hideConnectionLines(entity.component);
		},
		
		move = function(dx, dy) {
			var bb = entity.getBBox(), bb2 = pinEntity.getBBox(), transformStr = 't' + (entity.oBB.x - bb.x + dx) + ',' + (entity.oBB.y - bb.y + dy) + '...';
			
			entity.transform(transformStr);
			pinEntity.transform(transformStr);
			
			if (entity.selectionRect)
				entity.selectionRect.transform(transformStr);
				
			entity.forEach(function(e) {
				if (e.glowEntity)
					e.glowEntity.transform(transformStr);
			});
			
			if (!MooChip.lightMode)
				MooChip.scheme.updateConnectionLines(entity.component);
		},
		
		up = function() {
			entity.attr({ 'opacity': 1.0});
			pinEntity.attr({ 'opacity': 1.0});
			
			MooChip.scheme.showConnectionLines(entity.component);
			
			if (MooChip.lightMode)
				MooChip.scheme.updateConnectionLines(entity.component);
			
			// console.log(name, ' dropped!');
			// opera.postError(name, ' dropped!');
		};
		
		this.entity.drag(move, start, up);
		
		this.pinEntity.mouseover(function(){ if (MooChip.updatePinMeter) MooChip.updatePinMeter(this.pin.i, this.pin.u); if (!this.g) this.g = this.glow({'color':'#0101DF'}); }).mouseout(function(){ if (MooChip.updatePinMeter) MooChip.updatePinMeter(); if (this.g) { this.g.remove(); this.g = null; } });
	};
}

function Scheme() {
	this.components = [];
	this.connectionLines = [];
	this.src = null;
	this.queue = [];
	this.selectedComponent = null;
	this.selectedConnectionLine = null;
	
	MooChip.paper.canvas.onclick = function(e) {
		var selectedElement = MooChip.paper.getElementByPoint(e.clientX, e.clientY);
		
		if (!selectedElement || (selectedElement != MooChip.scheme.selectedConnectionLine && selectedElement.connectionLine != MooChip.scheme.selectedConnectionLine))
			MooChip.scheme.unselectConnectionLine();
		
		var components = MooChip.scheme.components, entity = selectedElement;
		
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
					MooChip.scheme.selectedComponent.entity.selectionRect.toBack();
					
					return;
				}
			}
		}
		
		MooChip.scheme.selectedComponent = null;
	};

	this.unselectConnectionLine = function(line) {
		// console.log('unselecting connection line');
		
		if (!MooChip.scheme.selectedConnectionLine) {
			if (line) {
				MooChip.scheme.selectedConnectionLine = line;
			}
				
			return;
		}
			
		var lines = [ MooChip.scheme.selectedConnectionLine, line ];
		
		for (var i = 0; i < lines.length; i++) {
			var selected = lines[i];
			
			if (!selected || !selected.pointEntities)
				continue;
		
			var pes = selected.pointEntities;
			
			for (var t = 0; t < pes.length; t++) {
				pes[t].remove();
			}
			
			selected.pointEntities = [];
		}
		
		MooChip.scheme.selectedConnectionLine = line;
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
	
	this.hideConnectionLines = function(component) {
		for (var i = 0; i < component.pins.length; i++) {
			var pin = component.pins[i], lines = MooChip.scheme.connectionLine(pin.entity);
			
			if (!lines || lines.length <= 0)
				continue;
			
			for (var t = 0; t < lines.length; t++) {
				var line = lines[t];
				
				line.visible = false;
				line.hide();
			}
		}
	};
	
	this.showConnectionLines = function(component) {
		for (var i = 0; i < component.pins.length; i++) {
			var pin = component.pins[i], lines = MooChip.scheme.connectionLine(pin.entity);
			
			if (!lines || lines.length <= 0)
				continue;
			
			for (var t = 0; t < lines.length; t++) {
				var line = lines[t];
				
				line.visible = true;
				line.show();
			}
		}
	};
	
	this.updateConnectionLines = function(component) {
		var setPointsForConnectionLine = function(line) { 
			var p1 = line.pinA.getPos(), p2 = line.pinB.getPos();
			
			if (!line.points) {
				var dx = Math.abs(p1.x - p2.x), dy = Math.abs(p1.y - p2.y);
				
				if (dx > 0 && dy > 0) {
					var p3 = { x: p1.x, y: p2.y};
					
					line.points = [ p1, p3, p2 ];
				} else {
					line.points = [ p1, p2 ];
				}
			} else {
				line.points[0] = p1;
				line.points[line.points.length - 1] = p2;
			}
		};
		
		var resolveWireCollisions = function() {
			return;
			
			var lines = MooChip.scheme.connectionLines;
			
			for (var i1 = 0; i1 < lines.length; i1++) {
				var line1 = lines[i1], pts1 = line1.points;
				
				if (!pts1)
					continue;
				
				for (var i2 = 0; i2 < lines.length; i2++) {
					if (i2 == i1)
						continue;
						
					var line2 = lines[i2], pts2 = line2.points;
					
					if (!pts2)
						continue;
					
					for (var t1 = 1; t1 < pts1.length; t1++) {
						for (var t2 = 1; t2 < pts2.length; t2++) {
							var path1 = { x1: pts1[t1 - 1].x, y1: pts1[t1 - 1].y, x2: pts1[t1].x, y2: pts1[t1].y }, 
								path2 = { x1: pts2[t2 - 1].x, y1: pts2[t2 - 1].y, x2: pts2[t2].x, y2: pts2[t2].y },
								intersection = Raphael.doLinesIntersect(path1, path2);
								
							if (!intersection)
								continue;
								
							console.log('Intersection: ', intersection, ' @ ', 
								//Raphael.format('Raphael.doLinesIntersect({ x1: {0}, y1: {1}, x2: {2}, y2: {3} }, { x1: {4}, y1: {5}, x2: {6}, y2: {7} })', path1.x1, path1.y1, path1.x2, path1.y2, path2.x1, path2.y1, path2.x2, path2.y2),
								path1, path2);
								
							line1.glow({ color: '#f00' });
							line2.glow({ color: '#00f' });
							
							break;
						}
					}
				}
			}
		};
			
		var routine = function(component) {
			var pins = component.pins;
		
			if (!pins) {
				console.log('No pins to update');
				
				return;
			}
			
			//resolveWireCollisions(MooChip.scheme.connectionLines);
					
			for (var i = 0; i < pins.length; i++) {
				var lines = MooChip.scheme.connectionLine(pins[i].entity);
				
				if (!lines || !lines.length)
					continue;
					
				for (var t = 0; t < lines.length; t++) {
					var line = lines[t], path = '';
					
					// setPointsForComponentConnectionLines(component);
					setPointsForConnectionLine(line);
					
					var pts = line.points;
					
					for (var j = 1; j < pts.length; j++) {
						path += Raphael.format('M{0},{1}L{2},{3}', pts[j - 1].x, pts[j - 1].y, pts[j].x, pts[j].y);
					}
					
					line.attr({ 'path': path });
					line.toBack();
				}
			}
		};
		
		if (!component) {
			for (var i = 0; i < MooChip.scheme.components.length; i++) {
				routine(MooChip.scheme.components[i]);
			}
		} else {
			routine(component);
		}
	}
	
	this.removeSelectedConnectionLine = function() {
		if (!this.selectedConnectionLine) {
			return;
		}
		
		for (var i = 0; i < this.components.length; i++) {
			for (var t = 0; t < this.components[i].pins.length; t++) {
				if (this.components[i].pins[t].pinEntity == this.selectionLine.pinA || 
					this.components[i].pins[t].pinEntity == this.selectionLine.pinB) {
					
				}
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
