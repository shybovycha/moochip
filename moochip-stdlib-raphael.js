Resistor = function(name, R) {
	var tmp = new Component('resistor');
	
	tmp.name = name;
	tmp.R = R;
	
	var a = new Pin(tmp, 'a');
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'b')
	tmp.pins.push(a);
	
	this.entity = MooChip.paper.set();
	this.entity.push(MooChip.paper.rect(40, 30, 40, 20).attr({'fill': MooChip.paper.raphael.color('#fff')}));
	this.entity.push(MooChip.paper.path('M40,40L20,40'));
	this.entity.push(MooChip.paper.path('M80,40L100,40'));
	
	this.pinEntity = MooChip.paper.set();
	
	var pinA = tmp.pin('a'), pinB = tmp.pin('b');

	pinA.createEntity(20, 40);
	pinB.createEntity(100, 40);
	
	this.pinEntity.push(pinA.entity);
	this.pinEntity.push(pinB.entity);
	
	var entity = this.entity, pinEntity = this.pinEntity,
	
		start = function() {
			entity.oBB = entity.getBBox();
			pinEntity.oBB = pinEntity.getBBox();
		},
		
		move = function(dx, dy) {
			var bb = entity.getBBox(), bb2 = pinEntity.getBBox();
			entity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
			pinEntity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
		},
		
		up = function() {
			console.log(name, ' dropped!');
		};
	
	entity.drag(move, start, up);
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('a') && this.pin('b').src == 'negative') {
			this.pin('b').i = I;
			this.pin('b').u = U;
			
			console.log(this.name, '!');
		} else
		if (pin == this.pin('b') && this.pin('a').src == 'negative') {
			this.pin('a').i = I;
			this.pin('a').u = U;
			
			console.log(this.name, '!');
		}
	};
	
	tmp.conduction = function(pinA, pinB) {
		return true;
	};
	
	return tmp;
}

Diode = function(name) {
	var tmp = new Component('diode');
	
	tmp.name = name;
	
	tmp.pins.push(new Pin(tmp, 'anode'));
	tmp.pins.push(new Pin(tmp, 'cathode'));
	
	this.entity = MooChip.paper.set();
	this.entity.push(MooChip.paper.path('M40,25L40,55L60,40L40,25z').attr({'fill': MooChip.paper.raphael.color('#fff')}));
	this.entity.push(MooChip.paper.path('M60,25L60,55'));
	this.entity.push(MooChip.paper.path('M40,40L20,40'));
	this.entity.push(MooChip.paper.path('M60,40L80,40'));

	this.pinEntity = MooChip.paper.set();
	
	var anode = tmp.pin('anode'), cathode = tmp.pin('cathode');

	anode.createEntity(20, 40);
	cathode.createEntity(80, 40);
	
	this.pinEntity.push(anode.entity);
	this.pinEntity.push(cathode.entity);
	
	var entity = this.entity, pinEntity = this.pinEntity,
	
		start = function() {
			entity.oBB = entity.getBBox();
			pinEntity.oBB = pinEntity.getBBox();
		},
		
		move = function(dx, dy) {
			var bb = entity.getBBox(), bb2 = pinEntity.getBBox();
			entity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
			pinEntity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
			
			for (var i = 0; i < tmp.pins.length; i++) {
				if (tmp.pins[i].connectionLine) {
					//tmp.pins[i].connectionLine.attr({'path': });
				}
			}
		},
		
		up = function() {
			console.log(name, ' dropped!');
		};
	
	entity.drag(move, start, up);
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('anode') && this.pin('cathode').src == 'negative') {
			this.pin('cathode').i = I;
			this.pin('cathode').u = U;
			
			console.log(this.name, '!');
		}
	};
	
	tmp.conduction = function(pinA, pinB) {
		if (pinB.name == 'cathode' && pinB.component == this)
			return true; else
				return false;
	};
	
	return tmp;
}

Wire = function(name) {
	var tmp = new Component('wire');
	
	tmp.name = name;
	
	this.entity = MooChip.paper.set();
	this.entity.push(MooChip.paper.circle(50, 25, 15).attr({'fill': MooChip.paper.raphael.color('#4C698A')}));

	this.pinEntity = MooChip.paper.set();
	
	var entity = this.entity, pinEntity = this.pinEntity,
	
		start = function() {
			entity.oBB = entity.getBBox();
			pinEntity.oBB = pinEntity.getBBox();
		},
		
		move = function(dx, dy) {
			var bb = entity.getBBox(), bb2 = pinEntity.getBBox();
			entity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
			pinEntity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
		},
		
		up = function() {
			console.log(name, ' dropped!');
		};
	
	entity.drag(move, start, up);
	
	tmp.invoke = function(pin, I, U) {
		for (var i = 0; i < this.pins.length; i++) {
			if (this.pins[i] == pin)
				continue;
				
			this.pins[i].i = I;
			this.pins[i].u = U;
		}
	};
	
	tmp.conduction = function(pinA, pinB) {
		return true;
	};
	
	tmp.connect = function(pin) {
		var lastPin = tmp.pins[tmp.pins.length - 1], N = (parseInt(lastPin ? lastPin.name : 0)) + 1, p = new Pin(tmp, N);
		p.connect(pin);
		p.createEntity(50, 25);
		tmp.pins.push(p);
		pinEntity.push(p.entity);
		return p;
	};
	
	return tmp;
}

DCSource = function(name, U, I) {
	var tmp = new Component('dc_source');
	
	if (!I)
		I = 1.0;
	
	tmp.name = name;
	tmp.U = U;
	tmp.I = I;
	
	var a = new Pin(tmp, 'positive');
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'negative')
	tmp.pins.push(a);
	
	this.entity = MooChip.paper.set();
	this.entity.push(MooChip.paper.circle(60, 40, 20).attr({'fill': MooChip.paper.raphael.color('#fff')}));
	this.entity.push(MooChip.paper.text(48, 40, '+').attr({'font': "16px Helvetica", 'font-weight': 'bold'}));
	this.entity.push(MooChip.paper.text(72, 38, '-').attr({'font': "16px Helvetica", 'font-weight': 'bold'}));
	this.entity.push(MooChip.paper.path('M40,40L20,40'));
	this.entity.push(MooChip.paper.path('M80,40L100,40'));
	
	this.pinEntity = MooChip.paper.set();
	
	var pinA = tmp.pin('positive'), pinB = tmp.pin('negative');

	pinA.createEntity(20, 40);
	pinB.createEntity(100, 40);
	
	this.pinEntity.push(pinA.entity);
	this.pinEntity.push(pinB.entity);
	
	var entity = this.entity, pinEntity = this.pinEntity,
	
		start = function() {
			entity.oBB = entity.getBBox();
			pinEntity.oBB = pinEntity.getBBox();
		},
		
		move = function(dx, dy) {
			var bb = entity.getBBox(), bb2 = pinEntity.getBBox();
			entity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
			pinEntity.translate(entity.oBB.x - bb.x + dx, entity.oBB.y - bb.y + dy);
		},
		
		up = function() {
			console.log(name, ' dropped!');
		};
	
	entity.drag(move, start, up);
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('negative')) {
			this.pin('positive').i = this.I;
			this.pin('positive').u = this.U;
			
			console.log(this.name, '!');
		}
	};
	
	tmp.conduction = function(pinA, pinB) {
		if (pinA.name == 'negative' && pinA.component == this)
		return true;
	};
	
	return tmp;
}