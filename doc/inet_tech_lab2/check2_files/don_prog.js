var program_div = document.getElementById("don_program");

// Load Flattr script
var s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto';
program_div.appendChild(s);

var sponsor_HP = new Array();
sponsor_HP['name'] = "HP";
sponsor_HP['image'] = 'http://www.w3.org/QA/Tools/logos_sup/hp_logo.jpg';
sponsor_HP['text'] = 'The W3C validators are hosted on server technology donated by HP, and supported by community donations.';
sponsor_HP['height'] = 80;
sponsor_HP['link'] = 'http://www.hp.com';

var sponsor_MOZ = new Array();
sponsor_MOZ['name'] = "Mozilla Foundation";
sponsor_MOZ['image'] = 'http://www.w3.org/QA/Tools/logos_sup/moz_logo.jpg';
sponsor_MOZ['text'] = 'The W3C validators are developed with assistance from the Mozilla Foundation, and supported by community donations.';
sponsor_MOZ['height'] = 76;
sponsor_MOZ['link'] = 'http://www.mozilla.com';

var sponsor_Donate = new Array();
sponsor_Donate['name'] = "Validators Donation Program";
sponsor_Donate['image'] = 'http://www.w3.org/QA/Tools/I_heart_validator_lg';
sponsor_Donate['text'] = 'The W3C validators rely on community support for hosting and development.';
sponsor_Donate['height'] = 46;
sponsor_Donate['link'] = 'http://www.w3.org/QA/Tools/Donate';

var rand_no = Math.random();
rand_no = rand_no * 100;
rand_no = Math.ceil(rand_no);

var sponsor_chosen = new Array();
//weighted based on financial value of support
if (rand_no <= 34) {
    sponsor_chosen = sponsor_HP;
}
else if (rand_no <=60 ) {
    sponsor_chosen = sponsor_MOZ;
}
else {
    sponsor_chosen = sponsor_Donate;
}

var img_span = document.createElement("span");
img_span.setAttribute("id","don_program_img");
img_span.setAttribute("lang","en");
img_span.setAttribute("dir","ltr");
var imagelink = document.createElement("a"); imagelink.setAttribute("href",sponsor_chosen["link"])
var image = document.createElement("img"); 
image.setAttribute("src", sponsor_chosen["image"]);
image.setAttribute("alt", sponsor_chosen["name"]+" Logo");
imagelink.appendChild(image); img_span.appendChild(imagelink); 
program_div.appendChild(img_span);

if (sponsor_chosen["height"] > 60 ) {
    program_div.style.minHeight = sponsor_chosen["height"]+"px";   
}

//Add Flattr button
var flattr_span = document.createElement("span");
flattr_span.setAttribute("style","float:right;");
var flattr_button = document.createElement("a");
flattr_button.setAttribute("class","FlattrButton");
flattr_button.setAttribute("href","http://validator.w3.org");
flattr_button.setAttribute("title","View W3C-Validator on flattr.com");
flattr_button.setAttribute("style","display:none;");
flattr_span.appendChild(flattr_button);
program_div.appendChild(flattr_span);

var txt_span = document.createElement("span");
txt_span.setAttribute("id","don_program_text");
txt_span.setAttribute("lang","en");
txt_span.setAttribute("dir","ltr");
var text1 = document.createTextNode(sponsor_chosen["text"]); txt_span.appendChild(text1);
var br = document.createElement("br"); txt_span.appendChild(br);

var donate_link = document.createElement("a"); donate_link.setAttribute("href","http://www.w3.org/QA/Tools/Donate")
var text_donate_link = document.createTextNode("Donate"); 
donate_link.appendChild(text_donate_link); txt_span.appendChild(donate_link);
var text3 = document.createTextNode(" and help us build better tools for a better web."); 
txt_span.appendChild(text3);
program_div.appendChild(txt_span);
if (sponsor_chosen["height"] > 60 ) {
    txt_span.style.paddingTop = (sponsor_chosen["height"]-40)+"px";
    txt_span.style.paddingBottom = (sponsor_chosen["height"]-40)+"px";
}

var clear = document.createElement("div");
clear.setAttribute("style","clear:both");
program_div.appendChild(clear);