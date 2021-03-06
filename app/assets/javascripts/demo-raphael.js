window.onload = function () {
	var browser = BrowserDetect.browser;
	
	if (browser == 'Explorer') {
		alert('Your browser is not supported yet.');
		return;
	}
		
	var R = Raphael('scheme-holder');
	
	MooChip.paper = R;
	MooChip.scheme = new Scheme();
	MooChip.updatePinMeter = update_pin_meter;
	MooChip.paper.canvas.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
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
		var prefixes = 
			{ 
				'resistor': 'r', 
				'diode': 'vd', 
				'wire': '-', 
				'dc_source': 'src', 
				'pnp_transistor': 'vt', 
				'npn_transistor': 'vt',
				'capacitor': 'c',
			}, 
			components = MooChip.scheme.components, 
			cnt = 1;
		
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
	if (type == 'capacitor') {
		var a = new Capacitor(generateName(type));
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
	if (MooChip.scheme.selectedComponent) {
		MooChip.scheme.remove(MooChip.scheme.selectedComponent);
	} else if (MooChip.scheme.selectedConnectionLine) {
		MooChip.scheme.removeSelectedConnectionLine();
	}
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

function article_search() {
	var query = jQuery('[name=search-query]:text').val();
	
	jQuery.getJSON('/search/' + query, function(data) {
		if (data) {
			var html = '';
			
			for (var i = 0; i < data.length; i++) {
				html += '<h2>' + data[i].title + '</h2>' + data[i].body + '<hr />';
			}

			jQuery('.help-panel').html(html);
		} else {
			jQuery('.help-panel').html('Nothing found.');
		}
	});
	
	return false;
}

function save_scheme_svg() {
	open('data:image/svg+xml,' + jQuery('#scheme-holder').html());
}
