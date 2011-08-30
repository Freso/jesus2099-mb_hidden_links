// ==UserScript==
// @name           mb: Display hidden and generated links in sidebar (lastfm, searches, etc.)
// @description    Hidden links include fanpage, social network, etc. (NO duplicates) Generated links (configurable) includes Google, auto last.fm, Discogs and LyricWiki searches, etc.
// @version        2011-08-30_1801
// @author         Tristan DANIEL (jesus2099)
// @contact        http://miaou.ions.fr
// @licence        GPL (http://www.gnu.org/copyleft/gpl.html)
// @namespace      http://userscripts.org/scripts/show/108889

// @include        http://*musicbrainz.org/artist/*
// @exclude        http://*musicbrainz.org/artist/*/edit
// ==/UserScript==

(function () {
/*todo:releases(-groups), recordings and works*/

/*settings*/
var artist_autolinks = {
	"Lastfm (mbid)": "http://last.fm/mbid/%artist-id%",
	"Lastfm (name)": "http://last.fm/music/%artist-name%",
	"BBC Music": "http://www.bbc.co.uk/music/artists/%artist-id%",
	"LyricWiki": "http://lyrics.wikia.com/%artist-name%",
	"Discogs search": "http://www.discogs.com/search?q=%artist-name%&type=artists",
	"CDJournal search": {"charset":"euc-jp", "action":"http://search.cdjournal.com/search/", "parameters":{"k":"%artist-name%"}},
	"Joshinweb search": {"charset":"Shift_JIS", "action":"http://joshinweb.jp/cdshops/Dps", "parameters":{"KEY":"ARTIST","FM":"0","KEYWORD":"%artist-name%"}},
	"Yunisan": "http://google.com/search?q=inurl%3Ayunisan%2Fvi%2F+%artist-name%",
	"VKDB": "http://google.com/search?q=site%3Avkdb.jp+%artist-name%",
	"VGMdb": "http://vgmdb.net/search?q=%artist-name%",
	"AllMusic": "http://allmusic.com/search/artist/%artist-name%",
	"Second hand songs": "http://www.secondhandsongs.com/cgi/topsearch.php?search_object=artist&search_text=%artist-name%",
	"en.Wikipedia": "http://en.wikipedia.org/w/index.php?search=%artist-name%",
	"ja.Wikipedia": "http://ja.wikipedia.org/w/index.php?search=%artist-name%",
	"Google (strict)": "http://google.com/search?q=%2B%22%artist-name%%22",
	"Google (normal)": "http://google.com/search?q=%artist-name%",
};
/*end of settings*/

var sidebar = document.getElementById("sidebar");
var arelsws = "/ws/2/artist/%artist-id%?inc=url-rels";
var existingLinks;

if (sidebar) {
	var artistid = self.location.href.match(/musicbrainz.org\/artist\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/i);
	if (artistid) {
		artistid = artistid[1];
		var artistname = document.getElementsByTagName("h1")[0].getElementsByTagName("a")[0].firstChild.nodeValue.trim();
		var extlinks = sidebar.getElementsByClassName("external_links");
		if (extlinks && extlinks.length>0) {
			extlinks = extlinks[0];
			loading(true);
			/*attached missing links*/
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(e) {
				if (xhr.readyState == 4 && xhr.status == 200) {
					var res = xhr.responseXML;
					var urls = res.evaluate("//mb:relation-list[@target-type='url']/mb:relation", res, nsr, XPathResult.ANY_TYPE, null);
					var haslinks = false;
					while (url = urls.iterateNext()) {
						var target = res.evaluate("./mb:target", url, nsr, XPathResult.ANY_TYPE, null);
						var turl = target.iterateNext();
						var begin = res.evaluate("./mb:begin", url, nsr, XPathResult.ANY_TYPE, null);
						begin = begin.iterateNext();
						if (begin) { begin = begin.textContent; } else { begin = ""; }
						var end = res.evaluate("./mb:end", url, nsr, XPathResult.ANY_TYPE, null);
						end = end.iterateNext();
						if (end) { end = end.textContent; } else { end = ""; }
						if (turl) {
							if (addExternalLink(url.getAttribute("type"), turl.textContent, begin, end)) {
								if (!haslinks) {
									haslinks = true;
									addExternalLink("Hidden links");
								}
							}
						}
					}
					/*artist_autolinks*/
					haslinks = false;
					for (link in artist_autolinks) {
						var target = artist_autolinks[link];
						if (typeof target == "string") {
							target = target.replace(/%artist-id%/, artistid).replace(/%artist-name%/, encodeURIComponent(artistname));
						}
						else {
							for (param in target["parameters"]) {
								target["parameters"][param] = target["parameters"][param].replace(/%artist-id%/, artistid).replace(/%artist-name%/, artistname)
							}
						}
						if (addExternalLink(link, target)) {
							if (!haslinks) {
								haslinks = true;
								addExternalLink("Generated links");
							}
						}
					}
					loading(false);
				}
			};
			xhr.open("GET", arelsws.replace(/%artist-id%/, artistid), true);
			xhr.send(null);
		}
	}/*artist*/
}

function addExternalLink(text, target, begin, end) {
	var newLink = true;
	var lis = extlinks.getElementsByTagName("li");
	if (!existingLinks) {
		existingLinks = [];
		for (ilis=0; ilis<lis.length; ilis++) {
			var lisas = lis[ilis].getElementsByTagName("a");
			if (lisas.length>0) { existingLinks.push(lisas[0].getAttribute("href").trim()); }
		}
	}
	if (target) {
		var li;
		if (typeof target != "string") {
			var form = document.createElement("form");
			form.setAttribute("accept-charset", target["charset"]);
			if (typeof opera == "undefined") {/*Opera already able to manage this*/
				form.addEventListener("click", function (e) {
					this.setAttribute("target", (e.shiftKey||e.ctrlKey)?"_blank":"_self");
				}, false);
			}
			form.setAttribute("action", target["action"]);
			for (param in target["parameters"]) {
				var input = document.createElement("input");
				input.setAttribute("type", "hidden");
				input.setAttribute("name", param);
				input.setAttribute("value", target["parameters"][param]);
				form.appendChild(input);
			}
			input = document.createElement("input");
			input.setAttribute("type", "submit");
			input.setAttribute("value", text);
			input.setAttribute("title", target["charset"]+" post request (shift/ctrl click for tabbing enabled)");
			form.appendChild(input);
			li = document.createElement("li");
			li.appendChild(form);
			extlinks.appendChild(li);
		}
		else {
			var exi = existingLinks.indexOf(target.trim());
			if (exi == -1) {
				existingLinks.push(target.trim());
				li = document.createElement("li");
				li.className = text;
				var a = document.createElement("a");
				a.setAttribute("href", target);
				a.appendChild(document.createTextNode(text));
				li.appendChild(a);
				extlinks.appendChild(li);
			}
			else {
				newLink = false;
				li = lis[exi];
			}
			if (begin || end) {
				var dates = " (";
				if (begin) { dates += begin; }
				if (begin != end) { dates += "\u2014"; }
				if (end && begin != end) { dates += end; }
				dates += ")";
				li.appendChild(document.createTextNode(dates));
			}
		}
	}
	else {
		var li = document.createElement("li");
		li.style.fontWeight = "bold";
		li.appendChild(document.createTextNode(text));
		extlinks.insertBefore(li, extlinks.lastChild);
	}
	return newLink;
}

function loading(on) {
	var ldng = document.getElementById("jesus2099loading108889");
	if (on) {
		if (!ldng) {
			var li = document.createElement("li");
			li.setAttribute("id", "jesus2099loading108889");
			li.style.background = "#ff6";
			li.appendChild(document.createTextNode("loading\u2026"));
			var lis = extlinks.getElementsByTagName("li");
			if (lis.length == 1 && lis[0].lastChild.nodeValue.indexOf("has no URL relationships.") != -1) {
				extlinks.replaceChild(li, lis[0]);
			}
			else {
				extlinks.appendChild(li);
			}
		}
	}
	else {
		if (ldng) {
			ldng.parentNode.removeChild(ldng);
		}
	}
}

function nsr(prefix) {
	switch (prefix) {
		case "mb":
			return "http://musicbrainz.org/ns/mmd-2.0#";
		default:
			return null;
	}
}

})();