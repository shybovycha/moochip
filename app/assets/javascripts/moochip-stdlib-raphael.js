Resistor = function(name, R) {
	var tmp = new Component('resistor');
	
	tmp.name = name;
	tmp.R = R;
	
	var a = new Pin(tmp, 'a');
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'b')
	tmp.pins.push(a);
	
	tmp.entity = MooChip.paper.set();
	tmp.entity.push(MooChip.paper.rect(40, 30, 40, 20).attr({'fill': MooChip.paper.raphael.color('#fff')}));
	tmp.entity.push(MooChip.paper.path('M40,40L20,40'));
	tmp.entity.push(MooChip.paper.path('M80,40L100,40'));
	tmp.entity.component = tmp;
	tmp.entity.forEach(function(e) { e.component = tmp; });

	tmp.pinEntity = MooChip.paper.set();
	
	var pinA = tmp.pin('a'), pinB = tmp.pin('b');

	pinA.createEntity(20, 40);
	pinB.createEntity(100, 40);
	
	tmp.pinEntity.push(pinA.entity);
	tmp.pinEntity.push(pinB.entity);
	
	tmp.updateDragFunctions();
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('a') && this.pin('b').src == 'negative') {
			this.pin('b').i = U / this.R;
			this.pin('b').u = U;
			
			console.log(this.name, '!');
			// opera.postError(this.name, '!');
			
			this.entity.glow({'color': MooChip.invokeGlowColor})
		} else
		if (pin == this.pin('b') && this.pin('a').src == 'negative') {
			this.pin('a').i = U / this.R;
			this.pin('a').u = U;
			
			console.log(this.name, '!');
			// opera.postError(this.name, '!');
			
			this.entity.glow({'color': MooChip.invokeGlowColor})
		}
	};
	
	tmp.uninvoke = function() {
		this.entity.unglow();
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
	
	tmp.entity = MooChip.paper.set();
	tmp.entity.push(MooChip.paper.path('M40,25L40,55L60,40L40,25z').attr({'fill': MooChip.paper.raphael.color('#fff')}));
	tmp.entity.push(MooChip.paper.path('M60,25L60,55'));
	tmp.entity.push(MooChip.paper.path('M40,40L20,40'));
	tmp.entity.push(MooChip.paper.path('M60,40L80,40'));
	tmp.entity.component = tmp;
	tmp.entity.forEach(function(e) { e.component = tmp; });

	tmp.pinEntity = MooChip.paper.set();
	
	var anode = tmp.pin('anode'), cathode = tmp.pin('cathode');

	anode.createEntity(20, 40);
	cathode.createEntity(80, 40);
	
	tmp.pinEntity.push(anode.entity);
	tmp.pinEntity.push(cathode.entity);
	
	tmp.updateDragFunctions();
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('anode') && this.pin('cathode').src == 'negative') {
			this.pin('cathode').i = I;
			this.pin('cathode').u = U;
			
			console.log(this.name, '!');
			// opera.postError(this.name, '!');
			
			this.entity.glow({'color': MooChip.invokeGlowColor})
		}
	};
	
	tmp.uninvoke = function() {
		this.entity.unglow();
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
	
	tmp.pins.push(new Pin(tmp, 'x'));
	
	tmp.entity = MooChip.paper.set();
	tmp.entity.push(MooChip.paper.circle(50, 25, 15).attr({'fill': MooChip.paper.raphael.color('#4C698A')}));
	tmp.entity.component = tmp;
	tmp.entity.forEach(function(e) { e.component = tmp; });

	tmp.pinEntity = MooChip.paper.set();
	
	var x = tmp.pin('x');

	x.createEntity(50, 25);
	
	tmp.pinEntity.push(x.entity);
		
	tmp.updateDragFunctions();
	
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
		var lastPin = this.pins[this.pins.length - 1], N = (parseInt(lastPin ? lastPin.name : 0)) + 1, p = new Pin(this, N);
		
		this.pins.push(p);
		
		p.createEntity(50, 25);
		pinEntity.push(p.entity);

		p.connect(pin);
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
	
	tmp.entity = MooChip.paper.set();
	tmp.entity.push(MooChip.paper.circle(60, 40, 20).attr({'fill': MooChip.paper.raphael.color('#fff')}));
	tmp.entity.push(MooChip.paper.text(48, 40, '+').attr({'font': "16px Helvetica", 'font-weight': 'bold'}));
	tmp.entity.push(MooChip.paper.text(72, 38, '-').attr({'font': "16px Helvetica", 'font-weight': 'bold'}));
	tmp.entity.push(MooChip.paper.path('M40,40L20,40'));
	tmp.entity.push(MooChip.paper.path('M80,40L100,40'));
	tmp.entity.component = tmp;
	tmp.entity.forEach(function(e) { e.component = tmp; });
	
	tmp.pinEntity = MooChip.paper.set();
	
	var pinA = tmp.pin('positive'), pinB = tmp.pin('negative');

	pinA.createEntity(20, 40);
	pinB.createEntity(100, 40);
	
	tmp.pinEntity.push(pinA.entity);
	tmp.pinEntity.push(pinB.entity);
	
	tmp.updateDragFunctions();
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('negative')) {
			this.pin('positive').i = this.I;
			this.pin('positive').u = this.U;
			
			console.log(this.name, '!');
			// opera.postError(this.name, '!');
		}
	};
	
	tmp.conduction = function(pinA, pinB) {
		if (pinA.name == 'negative' && pinA.component == this)
		return true;
	};
	
	return tmp;
}

PNPTransistor = function(name, h21e) {
	var tmp = new Component('pnp_transistor');
	
	tmp.name = name;
	tmp.h21e = h21e || 1.0;
	
	var a = new Pin(tmp, 'base');
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'collector')
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'emitter')
	tmp.pins.push(a);
	
	tmp.entity = MooChip.paper.set();
	tmp.entity.push(MooChip.paper.circle(50, 60, 20).attr({'fill': MooChip.paper.raphael.color('#fff')}));
	tmp.entity.push(MooChip.paper.path('M40,43L40,77'));
	tmp.entity.push(MooChip.paper.path('M15,60L40,60'));
	tmp.entity.push(MooChip.paper.path('M40,70L60,80'));
	tmp.entity.push(MooChip.paper.path('M60,40L40,50').attr({'arrow-end': 'classic-wide-long'}));
	tmp.entity.push(MooChip.paper.path('M60,40L60,20'));
	tmp.entity.push(MooChip.paper.path('M60,80L60,100'));
	tmp.entity.component = tmp;
	tmp.entity.forEach(function(e) { e.component = tmp; });

	tmp.pinEntity = MooChip.paper.set();
	
	var pinA = tmp.pin('base'), pinB = tmp.pin('collector'), pinC = tmp.pin('emitter');

	pinA.createEntity(15, 60);
	pinB.createEntity(60, 100);
	pinC.createEntity(60, 20);
	
	tmp.pinEntity.push(pinA.entity);
	tmp.pinEntity.push(pinB.entity);
	tmp.pinEntity.push(pinC.entity);
	
	tmp.updateDragFunctions();
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('emitter') && this.pin('base').src == 'negative' && this.pin('base').i && this.pin('base').u) {
			this.pin('collector').i = this.pin('emitter').i - this.pin('base').i;
			this.pin('collector').u = this.pin('emitter').u * this.h21e;
			
			console.log(this.name, '!');
			// opera.postError(this.name, '!');
			
			this.entity.glow({'color': MooChip.invokeGlowColor})
		}
	};
	
	tmp.uninvoke = function() {
		this.entity.unglow();
	};
	
	tmp.conduction = function(pinA, pinB) {
		if (pinA.name == 'emitter' && pinB.name == 'base')
			return true;
			
		/*if (pinA.name == 'emitter' && pinB.name == 'collector')
			return true;*/
			
		return false;
	};
	
	return tmp;
}

NPNTransistor = function(name, h21e) {
	var tmp = new Component('npn_transistor');
	
	tmp.name = name;
	tmp.h21e = h21e || 1.0;
	
	var a = new Pin(tmp, 'base');
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'collector')
	tmp.pins.push(a);
	
	var a = new Pin(tmp, 'emitter')
	tmp.pins.push(a);
	
	tmp.entity = MooChip.paper.set();
	tmp.entity.push(MooChip.paper.circle(50, 60, 20).attr({'fill': MooChip.paper.raphael.color('#fff')}));
	tmp.entity.push(MooChip.paper.path('M40,43L40,77'));
	tmp.entity.push(MooChip.paper.path('M15,60L40,60'));
	tmp.entity.push(MooChip.paper.path('M40,70L60,80').attr({'arrow-end': 'classic-wide-long'}));
	tmp.entity.push(MooChip.paper.path('M60,40L40,50'));
	tmp.entity.push(MooChip.paper.path('M60,40L60,20'));
	tmp.entity.push(MooChip.paper.path('M60,80L60,100'));
	tmp.entity.component = tmp;
	tmp.entity.forEach(function(e) { e.component = tmp; });

	tmp.pinEntity = MooChip.paper.set();
	
	var pinA = tmp.pin('base'), pinB = tmp.pin('collector'), pinC = tmp.pin('emitter');

	pinA.createEntity(15, 60);
	pinB.createEntity(60, 20);
	pinC.createEntity(60, 100);
	
	tmp.pinEntity.push(pinA.entity);
	tmp.pinEntity.push(pinB.entity);
	tmp.pinEntity.push(pinC.entity);
	
	tmp.updateDragFunctions();
	
	tmp.invoke = function(pin, I, U) {
		if (pin == this.pin('base')) {
			this.pin('emitter').i = this.pin('base').i + this.pin('collector').i;
			this.pin('emitter').u = this.pin('collector').u * this.h21e;
			
			console.log(this.name, '!');
			
			this.entity.glow({'color': MooChip.invokeGlowColor})
		}
	};
	
	tmp.uninvoke = function() {
		this.entity.unglow();
	};
	
	tmp.conduction = function(pinA, pinB) {
		if (pinA.name == 'base' && pinB.name == 'emitterr')
			return true;
			
		/*if (pinA.name == 'collector' && pinB.name == 'emitter')
			return true;*/
			
		return false;
	};
	
	return tmp;
}
