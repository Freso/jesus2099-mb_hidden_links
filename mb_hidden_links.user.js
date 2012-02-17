// ==UserScript==
// @name           MB. artist all links (+dates +favicons +search)
// @version        2012-02-17_0902
// @description    Hidden links include fanpage, social network, etc. (NO duplicates) Generated links (configurable) includes Google, auto last.fm, Discogs and LyricWiki searches, etc. Dates on URLs
// @namespace      http://userscripts.org/scripts/show/108889
// @author         Tristan DANIEL (jesus2099)
// @contact        http://miaou.ions.fr
// @licence        GPL (http://www.gnu.org/copyleft/gpl.html)
// @include        http://*musicbrainz.org/artist/*
// @exclude        http://*musicbrainz.org/artist/*/edit
// @exclude        http://*musicbrainz.org/artist/*/split
// @include        http://*musicbrainz.org/release/*
// ==/UserScript==
(function () {
/*------------settings*/
var sortnameSearchFor = new RegExp("[\u0384-\u1CF2\u1F00-\uFFFF]");/*U+2FA1D is currently out of js range*/
var autolinksOpacity = ".5"; /*can be dimmer than existing links*/
var artist_autolinks = {
	"LyricWiki": "http://lyrics.wikia.com/%artist-name%",
	"Discogs search": "http://www.discogs.com/search?q=%artist-name%&type=artists",
	/*"Fun stuff": null, // you can insert headers this way (IMPORTANT: don't use space as first character)*/
		"Pictures": "http://images.google.com/images?q=%artist-name%",
		"Videos": "http://www.youtube.com/results?search_query=%artist-name%",
	"Japanese stuff": null,
		"\u6B4C\u8A5E\u30BF\u30A4\u30E0": {"charset":"EUC-JP", "action":"http://www.kasi-time.com/search.php", "parameters":{"cat_index":"uta","keyword":"%artist-name%"}},
		"VGMdb": "http://vgmdb.net/search?q=%artist-name%",
		"ja.Wikipedia": "http://ja.wikipedia.org/w/index.php?search=%artist-name%",
		"\u97F3\u697D\u306E\u68EE": {"charset":"x-sjis", "action":"http://www.minc.gr.jp/minc-bin/art_lst1", "parameters":{"SRCHTYPE":"1","ARTISTNM":"%artist-name%"}},
		"CDJournal search": {"charset":"euc-jp", "action":"http://search.cdjournal.com/search/", "parameters":{"k":"%artist-name%"}},
		"Joshinweb search": {"charset":"Shift_JIS", "action":"http://joshinweb.jp/cdshops/Dps", "parameters":{"KEY":"ARTIST","FM":"0","KEYWORD":"%artist-name%"}},
		"Yunisan": "http://google.com/search?q=inurl%3Ayunisan%2Fvi%2F+%artist-name%",
		"VKDB": "http://google.com/search?q=site%3Avkdb.jp+%artist-name%",
	"Vietnamese stuff": null,
		"vi.Wikipedia": "http://vi.wikipedia.org/w/index.php?search=%artist-name%",
		"nh\u1EA1c s\u1ED1": "http://nhacso.net/tim-nghe-si/trang-1/%artist-name%.html",
	"Korean stuff": null,
		"maniadb": "http://www.maniadb.com/search.asp?sr=PO&q=%artist-name%",
	"Other stuff": null,
		"AllMusic": "http://allmusic.com/search/artist/%artist-name%",
		"Second hand songs": "http://www.secondhandsongs.com/cgi/topsearch.php?search_object=artist&search_text=%artist-name%",
		"en.Wikipedia": "http://en.wikipedia.org/w/index.php?search=%artist-name%",
		"*.Wikipedia": "http://www.google.com/search?q=site:wikipedia.org+%22%artist-name%%22",
		"Lastfm (mbid)": "http://last.fm/mbid/%artist-id%",
		"Lastfm (name)": "http://last.fm/music/%artist-name%",
		"BBC Music": "http://www.bbc.co.uk/music/artists/%artist-id%",
		"Google": "http://www.google.com/search?q=%artist-name%",
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
var hideAffiliates = true;
/*------------end of settings (don't edit below) */
var userjs = "j2ujs108889";
var sidebar = document.getElementById("sidebar");
var arelsws = "/ws/2/artist/%artist-id%?inc=url-rels";
var existingLinks, extlinks;
function do108889() {
	if (sidebar) {
		var rgextrels = document.getElementsByClassName("external_links_2");
		if (rgextrels && rgextrels.length > 0 && rgextrels[0].getElementsByTagName("li").length > 0 && rgextrels[0].previousSibling.tagName == "UL") {
			rgextrels[0].parentNode.insertBefore(document.createElement("h2"), rgextrels[0]).appendChild(document.createTextNode("Release group external links"));
		}
		var artistid = self.location.href.match(/musicbrainz.org\/artist\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/i);
		if (artistid) {
			artistid = artistid[1];
			arelsws = arelsws.replace(/%artist-id%/, artistid);
			var artistname = document.getElementsByClassName("artistheader")[0].getElementsByTagName("a")[0].firstChild.nodeValue.trim();
			var tmpsn = document.getElementsByClassName("artistheader")[0].getElementsByTagName("a")[0].getAttribute("title").split(",");
			var artistsortname = "";
			for (var isn=tmpsn.length-1; isn>=0; isn--) {
				artistsortname += tmpsn[isn].trim();
				if (isn != 0) {artistsortname += " "; }
			}
			extlinks = sidebar.getElementsByClassName("external_links");
			if (extlinks && extlinks.length>0) {
				extlinks = extlinks[0];
				loading(true);
				/*attached missing links*/
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(e) {
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							loading(false);
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
											addExternalLink(" Hidden links");
										}
									}
								}
							}
							/*artist_autolinks*/
							extlinksOpacity = autolinksOpacity;
							haslinks = false;
							for (link in artist_autolinks) {
								var target = artist_autolinks[link];
								var sntarget;
								if (target) {
									if (typeof target == "string") {
										if (artistname != artistsortname && artistname.match(sortnameSearchFor)) {
											sntarget = target.replace(/%artist-id%/, artistid).replace(/%artist-name%/, encodeURIComponent(artistsortname));
										}
										target = target.replace(/%artist-id%/, artistid).replace(/%artist-name%/, encodeURIComponent(artistname));
									}
									else {
										for (param in target["parameters"]) {
											target["parameters"][param] = target["parameters"][param].replace(/%artist-id%/, artistid).replace(/%artist-name%/, artistname)
										}
									}
								}
								if (addExternalLink(link, target, null, null, sntarget)) {
									if (!haslinks) {
										haslinks = true;
										addExternalLink(" Generated links");
									}
								}
							}
						} else if (xhr.status >= 400) {
							var txt = xhr.responseText.match(/\<error\>\<text\>(.+)\<\/text\>\<text\>/);
							txt = txt?txt[1]:"";
							error(xhr.status, txt);
						}
					}
				};
				xhr.open("GET", arelsws, true);
				xhr.send(null);
			}
		}/*artist*/
		if (hideAffiliates) {
			var affs = document.getElementById("sidebar-affiliates");
			if (affs) {
				affs.parentNode.removeChild(affs);
			}
		}
	}
}
var favicontry = [];
var extlinksOpacity = "1";
function addExternalLink(text, target, begin, end, sntarget) {
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
			var info = target["action"], info1 = true;
			for (param in target["parameters"]) {
				if (info1) { info1 = false; info += "?"; }
				else { info += "&"; }
				info += param+"="+target["parameters"][param];
				var input = document.createElement("input");
				input.setAttribute("type", "hidden");
				input.setAttribute("name", param);
				input.setAttribute("value", target["parameters"][param]);
				form.appendChild(input);
			}
			info += " ("+target["charset"]+")";
			var a = createA(text);
			a.setAttribute("title", info);
			a.addEventListener("mousedown", function (e) {
				e.preventDefault();
				if (e.button == 1) {
					this.parentNode.setAttribute("target", weirdobg());
					this.parentNode.submit();
				}
			}, false);
			a.addEventListener("click", function (e) {
				if (e.button == 0) {
					/*lame browsers;)*/
					if (typeof opera == "undefined") {
						if (e.shiftKey) {
							this.parentNode.setAttribute("target", "_blank");
						} else if (e.ctrlKey) {
							this.parentNode.setAttribute("target", weirdobg());
						}
					}
					this.parentNode.submit();
				}
			}, false);
			form.appendChild(a);
			form.appendChild(document.createTextNode(" ("));
			form.appendChild(document.createElement("code")).appendChild(document.createTextNode(target["charset"]));
			form.appendChild(document.createTextNode(")"));
			li = document.createElement("li");
			li.appendChild(form);
		}
		else {
			var exi = existingLinks.indexOf(target.trim());
			if (exi == -1) {
				existingLinks.push(target.trim());
				li = document.createElement("li");
				li.className = text;
				li.appendChild(createA(text, target));
			}
			else {
				newLink = false;
				li = lis[exi];
			}
			if (sntarget && newLink) {
				li.appendChild(document.createTextNode(" ("));
				li.appendChild(createA("sn", sntarget, "search with sortname"));
				li.appendChild(document.createTextNode(")"));
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
			if (this.width == 16) {
				this.li.style.backgroundImage = "url("+this.src+")";
			}
		}, false);
		favicontry[ifit].li = li;
		favicontry[ifit].src = favurlfound;
		favicontry[ifit].to = setTimeout(function(){ favicontry[ifit].src = "/"; }, 5000);
	}
	else {
		var li = document.createElement("li");
		li.style.background = "transparent";
		li.style.marginTop = ".5em";
		li.appendChild(document.createTextNode(text));
		if (text.indexOf(" ") == 0) {
			li.style.fontWeight = "bold";
			extlinks.insertBefore(li, extlinks.lastChild);
		}
		else {
			extlinks.appendChild(li);
		}
	}
	if (newLink) {
		li.style.opacity = extlinksOpacity;
		if (target) { extlinks.appendChild(li); }
	}
	return newLink;
}
function weirdobg() {
	var weirdo = userjs+(new Date().getTime());
	try { self.open("", weirdo).blur(); } catch(e) {}
	self.focus();
	return weirdo;
}
function error(code, text) {
	var ldng = document.getElementById("jesus2099loading108889");
	if (ldng) {
		ldng.setAttribute("id", "jesus2099error108889");
		ldng.style.background = "pink";
		ldng.replaceChild(document.createTextNode("Error "+code), ldng.firstChild);
		ldng.appendChild(createA("*", arelsws));
		ldng.appendChild(document.createTextNode(" in "));
		ldng.appendChild(createA("all links", "http://userscripts.org/scripts/show/108889"));
		ldng.appendChild(document.createTextNode(" ("));
		var retrybtn = createA("retry");
		retrybtn.addEventListener("click", function (e) {
			var err = document.getElementById("jesus2099error108889");
			if (err) { err.parentNode.removeChild(err); }
			do108889();
		}, false);
		ldng.appendChild(retrybtn);
		ldng.appendChild(document.createTextNode(")"));
		ldng.appendChild(document.createElement("br"));
		ldng.appendChild(document.createElement("i").appendChild(document.createTextNode(text)));
	}
	else {
		loading(true);
		error(code, text);
	}
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
function createA(text, link, title) {
	var a = document.createElement("a");
	if (link) {
		a.setAttribute("href", link);
	}
	else {
		a.style.cursor = "pointer";
	}
	if (title){ a.setAttribute("title", title); }
	a.appendChild(document.createTextNode(text));
	return a;
}
function nsr(prefix) {
	switch (prefix) {
		case "mb":
			return "http://musicbrainz.org/ns/mmd-2.0#";
		default:
			return null;
	}
}
do108889();
})();