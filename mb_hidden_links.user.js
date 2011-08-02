// ==UserScript==
// @name           mb: Display lastfm links
// @description    Adds a link to artsit's last.fm page in musicbrainz sidebar
// @version        2011-08-02_1400
// @history        2011-08-02_1400 fix URL encoding for non-Opera
// @history        2011-08-02_1246 link to lastfm artists
// @author         Tristan DANIEL (jesus2099)
// @contact        http://miaou.ions.fr
// @licence        GPL (http://www.gnu.org/copyleft/gpl.html)
// @namespace      http://userscripts.org/scripts/show/108889

// @include        http://*musicbrainz.org/artist/*

// ==/UserScript==

(function () {
/*todo:releases(-groups), recordings and works*/
var lastfmartist = "http://last.fm/%a%";
var sidebar = document.getElementById("sidebar");
if (sidebar) {
	var extlinks = sidebar.getElementsByClassName("external_links");
	if (extlinks.length>0) { extlinks = extlinks[0]; }
	else { extlinks = sidebar; }
	var artistname = document.getElementsByTagName("h1")[0].getElementsByTagName("a")[0].firstChild.nodeValue.trim();
	var li = document.createElement("li");
	var a = document.createElement("a");
	a.setAttribute("href", lastfmartist.replace(/%a%/, encodeURIComponent(artistname)));
	a.appendChild(document.createTextNode("Last.fm"));
	li.appendChild(a);
	extlinks.appendChild(li);
}

})();