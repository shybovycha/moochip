window.onload = function () {
	var R = Raphael('scheme-holder');
	
	MooChip.paper = R;
	MooChip.scheme = new Scheme();
};

function add(type) {
	var generateName = function(type) {
		var prefixes = { 'resistor': 'r', 'diode': 'vd', 'wire': '-', 'dc_source': 'src'}, components = MooChip.scheme.components, cnt = 1;
		
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
