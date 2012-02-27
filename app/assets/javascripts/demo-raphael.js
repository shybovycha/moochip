window.onload = function () {
	var browser = BrowserDetect.browser;
	
	if (browser == 'Explorer' || browser == 'Opera')
		return;
		
	var R = Raphael('scheme-holder');
	
	MooChip.paper = R;
	MooChip.scheme = new Scheme();
	MooChip.updatePinMeter = update_pin_meter;
};

function update_pin_meter(i, u) {
	if (i)
		document.getElementById('current-i').innerHTML = i + 'A'; else
			document.getElementById('current-i').innerHTML = '&oslash;';
			
	if (u)
		document.getElementById('current-u').innerHTML = u + 'V'; else
			document.getElementById('current-u').innerHTML = '&oslash;';
}

function add(type) {
	var generateName = function(type) {
		var prefixes = { 'resistor': 'r', 'diode': 'vd', 'wire': '-', 'dc_source': 'src', 'pnp_transistor': 'vt', 'npn_transistor': 'vt'}, 
			components = MooChip.scheme.components, cnt = 1;
		
		for (var i = 0; i < components.length; i++) {
			if (components[i].type == type) {
				cnt++;
			}
		}
		
		return prefixes[type] + cnt;
	};
	
	if (type == 'resistor') {
		var a = new Resistor(generateName(type), 1.0);
		MooChip.scheme.add(a);
	} else
	if (type == 'diode') {
		var a = new Diode(generateName(type));
		MooChip.scheme.add(a);
	} else
	if (type == 'pnp_transistor') {
		var a = new PNPTransistor(generateName(type));
		MooChip.scheme.add(a);
	} else
	if (type == 'npn_transistor') {
		var a = new NPNTransistor(generateName(type));
		MooChip.scheme.add(a);
	} else
	if (type == 'dc_source') {
		var a = new DCSource(generateName(type), 5.0, 1.0);
		MooChip.scheme.add(a);
	} else
	if (type == 'wire') {
		var a = new Wire(generateName(type));
		MooChip.scheme.add(a);
	}
}

function rotate_selected() {
	if (MooChip.scheme.selectedComponent)
		MooChip.scheme.selectedComponent.rotate(90);
}

function remove_selected() {
	if (MooChip.scheme.selectedComponent)
		MooChip.scheme.remove(MooChip.scheme.selectedComponent);
}

function reset_scheme() {
	MooChip.scheme.resetComponentStates();
}

function simple_step() {
	MooChip.scheme.singleStep();
}

function full_step() {
	MooChip.scheme.fullCircuitStep();
}
