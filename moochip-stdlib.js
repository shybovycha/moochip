Resistor = function(name, R) {
	var tmp = new Component('resistor');
	
	tmp.name = name;
	tmp.R = R;
	
	tmp.pins.push(new Pin(tmp, 'a'));
	tmp.pins.push(new Pin(tmp, 'b'));
	
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
		tmp.pins.push(p);
		return p;
	};
	
	return tmp;
}