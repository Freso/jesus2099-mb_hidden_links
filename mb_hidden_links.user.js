// ==UserScript==
// @name           mb: Display hidden and generated links in sidebar (lastfm, searches, etc.)
// @description    Hidden links include fanpage, social network, etc. (NO duplicates) Generated links (configurable) includes Google, auto last.fm, Discogs and LyricWiki searches, etc.
// @version        2011-08-03_1833
// @history        2011-08-03_1833 quickly added bbc and allmusic + fix empty list title display
// @version        2011-08-02_1833 forgot to re-paste some code in 1828
// @history        2011-08-02_1828 loads hidden links from Relationships tab + more generated links
// @history        2011-08-02_1400 fix URL encoding for non-Opera
// @history        2011-08-02_1246 link to lastfm artists
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
	/*"CDJournal search": "http://search.cdjournal.com/search/?k=%artist-name%", euc-jp impossible without ecl (22k) http://travel.han-be.com/ecl/Escape%20Codec%20Library%20ecl_js.htm
	  "Joshinweb search": "http://joshinweb.jp/cdshops/Dps?KEY=ARTIST&FM=0&KEYWORD=%artist-name%", Shift_JIS :/ */
	"AllMusic": "http://allmusic.com/search/artist/%artist-name%",
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
						if (turl) {
							if (addExternalLink(url.getAttribute("type"), turl.textContent)) {
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
						if (addExternalLink(link, artist_autolinks[link].replace(/%artist-id%/, artistid).replace(/%artist-name%/, encodeURIComponent(artistname)))) {
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

function addExternalLink(text, url) {
	var lis = extlinks.getElementsByTagName("li");
	if (!existingLinks) {
		existingLinks = [];
		for (ilis=0; ilis<lis.length; ilis++) {
			var lisas = lis[ilis].getElementsByTagName("a");
			if (lisas.length>0) { existingLinks.push(lisas[0].getAttribute("href").trim()); }
		}
	}
	if (url) {
		if (existingLinks.indexOf(url.trim()) == -1) {
			existingLinks.push(url.trim());
			var li = document.createElement("li");
			li.className = text;
			var a = document.createElement("a");
			a.setAttribute("href", url);
			a.appendChild(document.createTextNode(text));
			li.appendChild(a);
			extlinks.appendChild(li);
		}
		else { return false; }
	}
	else {
		var li = document.createElement("li");
		li.style.fontWeight = "bold";
		li.appendChild(document.createTextNode(text));
		extlinks.insertBefore(li, extlinks.lastChild);
	}
	return true;
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