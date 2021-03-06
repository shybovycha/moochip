var Cs = new Scheme();

var a = new Component('dc_source', 'src1');
a.pins.push(new Pin(a, 'positive'));
a.pins.push(new Pin(a, 'negative'));
a.pin('positive').i = 1;
a.pin('positive').u = 5;
Cs.add(a);

var a = new Resistor('r1', 1);
Cs.add(a);

var a = new Diode('vd1');
Cs.add(a);

var a = new Wire('-1');
Cs.add(a);

var a = new Wire('-2');
Cs.add(a);

Cs.component('-1').connect(Cs.component('vd1').pin('cathode'));
Cs.component('-2').connect(Cs.component('vd1').pin('anode'));

Cs.component('-1').connect(Cs.component('src1').pin('positive'));
Cs.component('-1').connect(Cs.component('r1').pin('a'));

Cs.component('-2').connect(Cs.component('src1').pin('negative'));
Cs.component('-2').connect(Cs.component('r1').pin('b'));

Cs.run(Cs.component('src1'));
