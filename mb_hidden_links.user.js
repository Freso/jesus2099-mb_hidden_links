// ==UserScript==
// @name           mb: Artist all links (+dates +favicons +search)
// @description    Hidden links include fanpage, social network, etc. (NO duplicates) Generated links (configurable) includes Google, auto last.fm, Discogs and LyricWiki searches, etc. Dates on URLs
// @version        2011-09-23_1851
// @author         Tristan DANIEL (jesus2099)
// @contact        http://miaou.ions.fr
// @licence        GPL (http://www.gnu.org/copyleft/gpl.html)
// @namespace      http://userscripts.org/scripts/show/108889

// @include        http://*musicbrainz.org/artist/*
// @exclude        http://*musicbrainz.org/artist/*/edit
// @exclude        http://*musicbrainz.org/artist/*/split
// ==/UserScript==

(function () {
/*------------settings*/
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
	"Google": "http://www.google.com/search?q=%artist-name%",
	"Google (images)": "http://images.google.com/images?q=%artist-name%",
	"Google (strict)": "http://www.google.com/search?q=%2B%22%artist-name%%22",
};
var favicons = {
	"allmusic.com": "http://allmusic.com/img/favicon.ico",
	"ameblo.jp": "http://ameblo.jp/favicon.ico",
	"bbc.co.uk": "http://www.bbc.co.uk/favicon.ico",
	"discogs.com": "http://musicbrainz.org/static/images/favicons/discogs-16.png",
	"exblog.jp": "http://exblog.jp/favicon.ico",
	"google.": "http://www.google.com/favicon.ico",
	"joshinweb.jp": "http://joshinweb.jp/favicon.ico",
	"last.fm": "http://musicbrainz.org/static/images/favicons/lastfm-16.png",
	"lastfm.": "http://musicbrainz.org/static/images/favicons/lastfm-16.png",
	"livedoor.jp": "http://blog.livedoor.jp/favicon.ico",
	"lyrics.wikia.com": "http://lyrics.wikia.com/favicon.ico",
	"metal-archives.com": "http://www.metal-archives.com/favicon.ico",
	"musicbrainz.org": "http://musicbrainz.org/favicon.ico",
	"rakuten.co.jp": "http://plaza.rakuten.co.jp/favicon.ico",
	"secondhandsongs.com": "http://www.secondhandsongs.com/art/icons/shs.png",
	"soundcloud.com": "http://musicbrainz.org/static/images/favicons/soundcloud-16.png",
	"vgmdb.net": "http://vgmdb.net/favicon.ico",
	"vkdb.jp": "http://www.vkdb.jp/favicon.ico",
	"wikipedia.org": "http://en.wikipedia.org/favicon.ico",
	"yahoo.": "http://blogs.yahoo.co.jp/favicon.ico",
};
var guessOtherFavicons = true;
/*------------end of settings*/

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

var favicontry = [];
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
			form.setAttribute("action", target["action"]);
			for (param in target["parameters"]) {
				var input = document.createElement("input");
				input.setAttribute("type", "hidden");
				input.setAttribute("name", param);
				input.setAttribute("value", target["parameters"][param]);
				form.appendChild(input);
			}
			var a = document.createElement("a");
			a.style.cursor = "pointer";
			a.appendChild(document.createTextNode(text));
			a.setAttribute("title", target["charset"]+" post request (shift/ctrl click for tabbing enabled)");
			a.addEventListener("click", function (e) {
				if (typeof opera == "undefined") {/*Opera already ok*/
					this.parentNode.setAttribute("target", (e.shiftKey||e.ctrlKey)?"_blank":"_self");
				}
				this.parentNode.submit();
			}, false);
			form.appendChild(a);
			form.appendChild(document.createTextNode(" ("));
			form.appendChild(document.createElement("code")).appendChild(document.createTextNode(target["charset"]));
			form.appendChild(document.createTextNode(")"));
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
		var favurltest = (typeof target == "string")?target:target["action"];
		var favurlfound = false;
		for (part in favicons) {
			if (favurltest.indexOf(part) != -1) {
				favurlfound = favicons[part];
				break;
			}
		}
		if (guessOtherFavicons && !favurlfound) {
			favurlfound = favurltest.substr(0, favurltest.indexOf("/", 7))+"/favicon.ico";
		}
		var ifit = favicontry.length;
		favicontry[ifit] = new Image();
		/*favicontry.addEventListener("error", function (e) {
		}, false);*/
		favicontry[ifit].addEventListener("load", function (e) {
			clearTimeout(this.to);
			this.li.style.backgroundImage = "url("+this.src+")";
		}, false);
		favicontry[ifit].li = li;
		favicontry[ifit].src = favurlfound;
		favicontry[ifit].to = setTimeout(function(){ favicontry[ifit].src = "/"; }, 5000);
	}
	else {
		var li = document.createElement("li");
		li.style.fontWeight = "bold";
		li.style.background = "transparent";
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