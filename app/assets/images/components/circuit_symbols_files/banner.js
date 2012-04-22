//////////////////////////////////////////////////////////////////////////////
// configuration
//
var cookie_prefix = 'tqb_'; // session cookie prefix

//////////////////////////////////////////////////////////////////////////////
// extract team_id from URL
//
var url_parts = self.location.pathname.split('/');
if (url_parts[1].charAt(0) == '~') {
 team_id = url_parts[1].substring(1, url_parts[1].length);
} else if (url_parts[1].match(/^[0-9]{2}[a-zA-Z]{3}$/)) {
 team_id = url_parts[1] + '/' + url_parts[2];
} else if (url_parts[1].match(/^[0-9]{2}[a-zA-Z]{3}-[a-zA-Z]+-(([nw]-[0-9]{3})|([0-9]{2,3}))$/)) {
 team_id = url_parts[1] + '/' + url_parts[2];
} else if (url_parts[1].match(/^trio$/)) {
 team_id = url_parts[1].toUpperCase() + '/' + url_parts[2];
} else {
 team_id = url_parts[1];
} // if

//////////////////////////////////////////////////////////////////////////////
// banner content
//
var bannerHtml =
  '     <link rel="stylesheet" href="/banner/banner.css" type="text/css" media="screen" charset="utf-8" />' +
  '	<div id="banner_wrap">' +
  '	<div id="banner">' +
  '	 <div id="banner_links">' +
  '	   <p>Projects by Students for Students</p>' +
  '	  <ul>' +
  '	   <li><a href="http://thinkquest.org/library/" target="_new">Library</a></li>' +
  '	   <li> | <a href="http://thinkquest.org/pls/html/think.help?id=199737" target="_new">FAQ</a></li>' +
  '	   <li> | <a href="http://thinkquest.org/pls/html/think.document?t=privacy_policy_comp&c=us" target="_new" class="active">Privacy Policy</a></li>' +
  '	   <li> | <a href="http://www.thinkquest.org/pls/html/think.document?t=tou_comp&c=us" target="_new" class="last">Terms of Use</a></li>' +
  '	  </ul>' +
  '	 </div>' +
  '	 <div class="buttons_right">' +
  '        <a href="http://thinkquest.org/library/site.html?team_id=' + team_id + '" target="_new" class="orange_button"><span>About this Site</span></a>' +
  '	   <a href="#" onClick="closeBanner();" class="orange_button"><span>X</span></a>' +
  '	 </div>' +
  '      <div class="banner_logo_link"><a href="http://thinkquest.org/library/" target="_new" id="logo"> </a></div>' +
  '	</div>' +
  '	</div>';

//////////////////////////////////////////////////////////////////////////////
// closeBanner, minimizeBanner, maximizeBanner
//
function closeBanner() {
  top.document.getElementById("banner_wrap").style.display = "none";
  top.document.body.style.setProperty("padding-top", "0px;", "null");
  setCookie(team_id, 'none');
}

//////////////////////////////////////////////////////////////////////////////
// cookies
//
function setCookie(name, value) {
 document.cookie = cookie_prefix + name + "=" + escape(value) + "; path=/";
}

function getCookie(name) {
 var dc = document.cookie;
 var prefix = cookie_prefix + name + "=";
 var begin = dc.indexOf("; " + prefix);
 if (begin == -1) {
   begin = dc.indexOf(prefix);
   if (begin != 0) return null;
 } else {
   begin += 2;
 }
 var end = document.cookie.indexOf(";", begin);
 if (end == -1) {
   end = dc.length;
 }
 return unescape(dc.substring(begin + prefix.length, end));
}

var tql_gTitle = "ThinkQuest Library";
var cookie_value = getCookie(team_id);

function tql_addBanner() {
  return (top === self);
}

function tql_drawTop() {
  if (!tql_addBanner()) {
    return;
  }

  if (cookie_value == 'none') {
    return;
  }

  var l_loc = window.location;
  var l_iframe_src = l_loc.protocol + '//' + l_loc.host + l_loc.pathname + l_loc.search +
    (l_loc.search ? '&' : '?') + 'tql-iframe' + l_loc.hash;

  document.write(bannerHtml);
  document.write(
    '<iframe id="tql-banner-iframe" frameborder="0" src="' + l_iframe_src + '" noresize="noresize" name="tql-banner-iframe">'
  );
}

function tql_drawBottom() {
  if (!tql_addBanner()) {
    if (top.document.title == tql_gTitle) {
      top.document.title = document.title;
    }
    return;
  }

  if (cookie_value == 'none') {
    return;
  }

  document.write(
    '</iframe>' +
    '</body>'
  );
}
