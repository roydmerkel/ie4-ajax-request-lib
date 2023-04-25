function AjaxRequest() {
	this.ajaxObject = null; // used to simplify fallthrough detection.
	this.iframeObject = null;
	this.msxml1Obj = null;
	this.msxml2Obj = null;
	this.msxml3Obj = null;
	this.xmlhttprequestObj = null;
	this.msxml1PollCallbackName = null;
	this.iframePollCallbackName = null;
	this.iframePrepXHRPollCallbackName = null;
	this.initializing = true;
	AjaxRequest.objIdx++;
	
	// IE 4 doesn't have async or await because... IE... so using this kludge instead...
	this.initizingCallbackName = "PollInit" + AjaxRequest.objIdx.toString();
	this.loadHTMLCallbackName = "loadHTML" + AjaxRequest.objIdx.toString();
	window[this.initizingCallbackName] = (function(self) { 
		return function() {
			if(AjaxRequest.initializing) {
				window.setTimeout(self.initizingCallbackName + "();", 100);
			} else {
				self.finishInitInstance();
			}
		};
	})(this);
	window.setTimeout(this.initizingCallbackName + "();", 100);
}

if(!Object.keys) {

	Object.keys = function(obj) {
		var keys = [];

		for(var i in obj) {
			if(obj && obj.hasOwnProperty && obj.hasOwnProperty(i)) {
				keys[keys.length] = i;
			} else if(obj && obj[i] !== null && typeof obj[i] !== "undefined") {
				keys[keys.length] = i;
			}
		}

		return keys;
	};
}

if((typeof global == "undefined" || !global.encodeURIComponent) &&
   (typeof window == "undefined" || !window.encodeURIComponent)) {
	var root = (typeof global == "undefined") ? window : global;

	root.encodeURIComponent = function(str) {
		var utf8encode = function(ch) {
			var chars = [];
			
			if(ch >= 0x000000 && ch <= 0x00007F) {
				chars[chars.length] = ch;
			} else if(ch >= 0x000080 && ch <= 0x0007FF) {
				chars[chars.length] = (((ch & 0x07C0) >> 6) & 0x003F) | 0x00C0;
				chars[chars.length] = (ch & 0x003F) | 0x80;
			} else if(ch >= 0x000800 && ch <= 0x00FFFF) {
				chars[chars.length] = (((ch & 0xF000) >> 12) & 0x003F) | 0x00E0;
				chars[chars.length] = (((ch & 0x0FC0) >> 6) & 0x003F) | 0x0080;
				chars[chars.length] = (ch & 0x003F) | 0x80;
			} else if(ch >= 0x010000 && ch <= 0x1FFFFF) {
				chars[chars.length] = (((ch & 0x1C0000) >> 18) & 0x0007) | 0x00F0;
				chars[chars.length] = (((ch & 0x03F000) >> 12) & 0x003F) | 0x0080;
				chars[chars.length] = (((ch & 0x000FC0) >> 6) & 0x003F) | 0x0080;
				chars[chars.length] = (ch & 0x00003F) | 0x80;
			} else if(ch >= 0x00200000 && ch <= 0x03FFFFFF) {
				chars[chars.length] = (((ch & 0x3000000) >> 24) & 0x0003) | 0x00F8;
				chars[chars.length] = (((ch & 0x0FC0000) >> 18) & 0x003F) | 0x0080;
				chars[chars.length] = (((ch & 0x003F000) >> 12) & 0x003F) | 0x0080;
				chars[chars.length] = (((ch & 0x0000FC0) >> 6) & 0x003F) | 0x0080;
				chars[chars.length] = (ch & 0x00003F) | 0x80;
			} else if(ch >= 0x00200000 && ch <= 0x7FFFFFFF) {
				chars[chars.length] = (((ch & 0x40000000) >> 30) & 0x0001) | 0x00FC;
				chars[chars.length] = (((ch & 0x3F000000) >> 24) & 0x003F) | 0x0080;
				chars[chars.length] = (((ch & 0x00FC0000) >> 18) & 0x003F) | 0x0080;
				chars[chars.length] = (((ch & 0x0003F000) >> 12) & 0x003F) | 0x0080;
				chars[chars.length] = (((ch & 0x00000FC0) >> 6) & 0x003F) | 0x0080;
				chars[chars.length] = (ch & 0x00003F) | 0x80;
			} else {
				chars[chars.length] = 0xFE;
				chars[chars.length] = 0x80;
				chars[chars.length] = ((ch >>> 30) & 0x003F) | 0x0080;
				chars[chars.length] = ((ch >>> 24) & 0x003F) | 0x0080;
				chars[chars.length] = ((ch >>> 18) & 0x003F) | 0x0080;
				chars[chars.length] = ((ch >>> 12) & 0x003F) | 0x0080;
				chars[chars.length] = ((ch >>> 6) & 0x003F) | 0x0080;
				chars[chars.length] = (ch & 0x00003F) | 0x80;
			}
			
			return chars;
		};
		
		var s = "";
		for (var i = 0, ch = str.charCodeAt(i); ch || ch === 0; i++, ch = str.charCodeAt(i)) {
			if(ch >= 0xD800 && ch <= 0xDBFF)
			{
				var w1 = ch & 0x3FF;
				
				ch = str.charCodeAt(i + 1);
				if(!ch && ch !== 0) {
					return null;
				} else if(ch < 0xDC00 || ch > 0xDFFF) {
					return null;
				} else {
					var w2 = ch & 0x3FF;
					var u = ((w1 << 10) | w2) + 0x10000;
					
					i++;
					
					u = utf8encode(u);
					
					for(var j = 0; j < u.length; j++) {
						var chhex = u[j].toString(16);
						if(chhex.length < 1) {
							chhex = "0" + chhex;
						}
						if(chhex.length < 2) {
							chhex = "0" + chhex;
						}
						s += "%" + chhex;
					}
				}
			}  else if(ch >= "A".charCodeAt() && ch <= "Z".charCodeAt()) {
				s += String.fromCharCode(ch);
			}  else if(ch >= "a".charCodeAt() && ch <= "z".charCodeAt()) {
				s += String.fromCharCode(ch);
			}  else if(ch >= "0".charCodeAt() && ch <= "9".charCodeAt()) {
				s += String.fromCharCode(ch);
			}  else if(ch == "-".charCodeAt() || ch == "_".charCodeAt()
						|| ch == ".".charCodeAt() || ch == "!".charCodeAt()
						|| ch == "~".charCodeAt() || ch == "*".charCodeAt()
						|| ch == "'".charCodeAt() || ch == "(".charCodeAt()
						|| ch == ")".charCodeAt()) {
				s += String.fromCharCode(ch);
			} else {
				var u = utf8encode(ch);
				
				for(var j = 0; j < u.length; j++) {
					var chhex = u[j].toString(16);
					if(chhex.length < 1) {
						chhex = "0" + chhex;
					}
					if(chhex.length < 2) {
						chhex = "0" + chhex;
					}
					s += "%" + chhex;
				}
			}
		}
		
		return s;
	};
}

if (!window.JSON) {
	window.JSON = {
		parse: function(sJSON) { return eval('(' + sJSON + ')'); },
		stringify: (function () {
			var toString = Object.prototype.toString;
			var isArray = Array.isArray || function (a) { return a.toString() === '[object Array]'; };
			var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
			var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
			var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
			return function stringify(value) {
				if (value == null) {
					return 'null';
				} else if (typeof value === 'number') {
					return isFinite(value) ? value.toString() : 'null';
				} else if (typeof value === 'boolean') {
					return value.toString();
				} else if (typeof value === 'object') {
					if (typeof value.toJSON === 'function') {
						return stringify(value.toJSON());
					} else if (isArray(value)) {
						var res = '[';
						for (var i = 0; i < value.length; i++)
						res += (i ? ', ' : '') + stringify(value[i]);
						return res + ']';
					} else if (value.toString() === '[object Object]') {
						var tmp = [];
						for (var k in value) {
							if (value && (typeof value[k]) != "undefined") {
								tmp[tmp.length] = stringify(k) + ': ' + stringify(value[k]);
							}
						}
						return '{' + tmp.join(', ') + '}';
					}
				}
				return '"' + value.toString().replace(escRE, escFunc) + '"';
			};
		})()
	};
}

AjaxRequest.getChildById = function(elem, id)
{
	if(elem)
	{
		if(elem.id == id)
		{
			return elem;
		}
		else if(elem.children)
		{
			for (var i = 0; i < elem.children.length; i++) {
				var iterRet = AjaxRequest.getChildById(elem.children[i], id);
				
				if(iterRet)
				{
					return iterRet;
				}
			}
		}
	}
	
	return null;
};

AjaxRequest.getChildByTag = function(elem, tag)
{
	if(elem)
	{
		if(elem.tagName.toLowerCase() == tag.toLowerCase())
		{
			return elem;
		}
		else if(elem.children)
		{
			for (var i = 0; i < elem.children.length; i++) {
				var iterRet = AjaxRequest.getChildByTag(elem.children[i], tag);
				
				if(iterRet)
				{
					return iterRet;
				}
			}
		}
	}
	
	return null;
};

AjaxRequest.bindEvent = function (element, type, handler) {
   if(element.addEventListener) {
      element.addEventListener(type, handler, false);
   } else if(element.attachEvent) {
      element.attachEvent('on'+type, handler);
   } else {
	   element['on'+type] = handler;
   }
}

AjaxRequest.objIdx = 0;
AjaxRequest.iframeIdx = 0;
AjaxRequest.msxmlIdx = 0;
AjaxRequest.initializing = true;
AjaxRequest.windowonerror = null;
AjaxRequest.hasmsxml1 = false;
AjaxRequest.hasmsxml1a = false;
AjaxRequest.hasmsxml2 = false;
AjaxRequest.hasmsxml3 = false;
AjaxRequest.hasxmlhttprequest = false;

AjaxRequest.html_attributes = [
	"accept",
	"accept-charset",
	"accesskey",
	"action",
	"align",
	"alt",
	"async",
	"autocomplete",
	"autofocus",
	"autoplay",
	"border",
	"bgcolor",
	"charset",
	"checked",
	"cite",
	"class",
	"color",
	"cols",
	"colspan",
	"content",
	"contenteditable",
	"controls",
	"coords",
	"data",
	"data-*",
	"datetime",
	"default",
	"defer",
	"dir",
	"dirname",
	"disabled",
	"draggable",
	"dropzone",
	"enctype",
	"face",
	"for",
	"form",
	"formaction",
	"headers",
	"height",
	"hidden",
	"high",
	"href",
	"hreflang",
	"http-equiv",
	"id",
	"ismap",
	"kind",
	"label",
	"lang",
	"list",
	"loop",
	"low",
	"max",
	"maxlength",
	"media",
	"method",
	"min",
	"multiple",
	"muted",
	"name",
	"novalidate",
	"onabort",
	"onafterprint",
	"onbeforeprint",
	"onbeforeunload",
	"onblur",
	"oncanplay",
	"oncanplaythrough",
	"oncanplaythrough",
	"onchange",
	"onclick",
	"oncontextmenu",
	"oncopy",
	"oncuechange",
	"oncut",
	"ondblclick",
	"ondrag",
	"ondragend",
	"ondragenter",
	"ondragleave",
	"ondragover",
	"ondragstart",
	"ondrop",
	"ondurationchange",
	"onemptied",
	"onended",
	"onerror",
	"onfocus",
	"onhashchange",
	"oninput",
	"oninvalid",
	"onkeydown",
	"onkeypress",
	"onkeyup",
	"onload",
	"onloadeddata",
	"onloadedmetadata",
	"onloadstart",
	"onmousedown",
	"onmousemove",
	"onmouseout",
	"onmouseover",
	"onmouseup",
	"onmousewheel",
	"onoffline",
	"ononline",
	"onpagehide",
	"onpageshow",
	"onpaste",
	"onpause",
	"onplay",
	"onplaying",
	"onpopstate",
	"onprogress",
	"onratechange",
	"onreset",
	"onresize",
	"onscroll",
	"onsearch",
	"onseeked",
	"onseeking",
	"onselect",
	"onstalled",
	"onstorage",
	"onsubmit",
	"onsuspend",
	"ontimeupdate",
	"ontoggle",
	"onunload",
	"onvolumechange",
	"onwaiting",
	"onwheel",
	"open",
	"optimum",
	"pattern",
	"placeholder",
	"poster",
	"preload",
	"readonly",
	"rel",
	"required",
	"reversed",
	"rows",
	"rowspan",
	"sandbox",
	"scope",
	"selected",
	"shape",
	"size",
	"sizes",
	"span",
	"spellcheck",
	"src",
	"srcdoc",
	"srclang",
	"srcset",
	"start",
	"step",
	"style",
	"tabindex",
	"target",
	"title",
	"translate",
	"type",
	"usemap",
	"value",
	"width",
	"wrap"
];

AjaxRequest.prototype.finishInitInstance = function() {  
	if(AjaxRequest.hasxmlhttprequest) {
			this.xmlhttprequestObj = new XMLHttpRequest();
			this.ajaxObject = this.xmlhttprequestObj;
			this.xmlhttprequestObj.onreadystatechange = (function(self, xhr) {
				return function() {
					if (xhr.readyState == 4)
					{
						xhr.onreadystatechange = function() {};
						if(xhr.status == 200) {
							// Action to be performed when the document is read;
							if(self.xmlhttprequestCallback) {
								self.xmlhttprequestCallback(xhr.responseText);
							}
						} else {
							// TODO: handle error.
						}
					}
				};
			})(this, this.xmlhttprequestObj);
			this.xmlhttprequestCallback = null;
	} else if(AjaxRequest.hasmsxml3) {
			this.msxml3Obj = new ActiveXObject("MSXML2.XMLHTTP");
			this.ajaxObject = this.msxml3Obj;
			this.msxml3Obj.onreadystatechange = (function(self, xhr) {
				return function() {
					if (xhr.readyState == 4)
					{
						xhr.onreadystatechange = function() {};
						if(xhr.status == 200) {
							// Action to be performed when the document is read;
							if(self.msxmlCallback) {
								self.msxmlCallback(xhr.responseText);
							}
						} else {
							// TODO: handle error.
						}
					}
				};
			})(this, this.msxml3Obj);
			this.msxmlCallback = null;
	} else if(AjaxRequest.hasmsxml2) {
			this.msxml2Obj = new ActiveXObject("Microsoft.XMLHTTP");
			this.ajaxObject = this.msxml2Obj;
			this.msxml2Obj.onreadystatechange = (function(self, xhr) {
				return function() {
					if (xhr.readyState == 4)
					{
						xhr.onreadystatechange = function() {};
						if(xhr.status == 200) {
							// Action to be performed when the document is read;
							if(self.msxmlCallback) {
								self.msxmlCallback(xhr.responseText);
							}
						} else {
							// TODO: handle error.
						}
					}
				};
			})(this, this.msxml2Obj);
			this.msxmlCallback = null;
	} else if(AjaxRequest.hasmsxml1 || AjaxRequest.hasmsxml1a) {
		//try {
			this.msxml1Obj = new ActiveXObject("MSXML");
			this.ajaxObject = this.msxml1Obj;
			
			AjaxRequest.msxmlIdx++;
			this.msxml1PollCallbackName = "MSXML" + AjaxRequest.msxmlIdx.toString();
			// TODO: add onerror to handle error.
			window[this.msxml1PollCallbackName] = (function(self, httprequest, fName) { 
				return function () { 
					if(httprequest.readyState < 4) {
						window.setTimeout(fName + "();", 1000);
					} else {
						self.msxml1Callback();
					}
				}; 
			})(this, this.msxml1Obj, this.msxml1PollCallbackName );
			this.msxmlCallback = null;
		//} catch(ex) {
		//}
	} else {
		var iframe = null;
		
		// in IE 8-11 a hack must be applied to allow contentDocument to be visible -- hence complicated src
		// in IE 4 and 5, appendChild will result in broken image instead of iframe, so innerHTML append is used instead.
		/*if(document && document.body && document.body.appendChild) {
			iframe = document.createElement('iframe');
			iframe.id = 'ajax_helper_' + AjaxRequest.iframeIdx.toString();
			iframe.name = 'ajax_helper_' + AjaxRequest.iframeIdx.toString();
			iframe.style.cssText = 'display: none;';
			iframe.src = 'javascript:void((function(){var script = document.createElement("script");' +
						  'script.innerHTML = "(function() {' +
						  'document.open();document.domain=\"' + document.domain +
						  '\";document.close();})();";' +
						  'document.write("<head>" + script.outerHTML + "</head><body></body>");})())';
			
			document.body.appendChild(iframe);
		} else {*/
			document.body.innerHTML += "\n" + '<iframe id="' + 'ajax_helper_' + AjaxRequest.iframeIdx.toString() + '" ' + 
											'name="' + 'ajax_helper_' + AjaxRequest.iframeIdx.toString() + '" ' +
											'hidden="true" style="display: none;" src=' + "'" +
													'javascript:void((function(){var script = document.createElement("script");' +
													'script.innerHTML = "(function() {' +
													'document.open();document.domain=\\\"' + document.domain +
													'\\\";document.close();})();";' +
													'document.write("<head>" + script.outerHTML + "</head><body></body>");})())'											
												+ "'" + '>' +
											'</iframe>';
											
			iframe = AjaxRequest.getChildById(document.body, 'ajax_helper_' + AjaxRequest.iframeIdx.toString());
		//}

		this.iframeObject = iframe;
		this.ajaxObject = this.iframeObject;
		this.iframeLoadCallback = (function(self) {
			return function(obj) {
				var iframeDoc = (obj.contentWindow || obj.contentDocument);
				if (iframeDoc && iframeDoc.document)
				{
					iframeDoc = iframeDoc.document;
				}
				// on IE 4, there is no contentWindow or contentDocument, so frames must be iterated instead.
				if (!iframeDoc) {
					var frames = window.frames;
					var frame = frames[obj.id];
					iframeDoc = frame.document;
				}
				if(iframeDoc) {
					var iframeBody = iframeDoc.body;
					if(iframeBody) {
						var html = iframeBody.innerHTML;
						html = he.decode(html);
						html = html.replace(/^[ \t]*[<]pre style=["][^\"]*["][>]/i, "");
						html = html.replace(/[<][/]pre[>][ \t]*$/i, "");
						self.iFrameCallback(html);
					}
				}
			};
		})(this);
		
		this.iframePollCallbackName = "IFRAME" + AjaxRequest.iframeIdx.toString();
		// TODO: add onerror to handle error.
		window[this.iframePollCallbackName] = (function(self, iframeObject, fName) { 
			return function () {
				var iframe = document.getElementById(iframeObject.id);
				var iframeDoc = (iframe.contentWindow || iframe.contentDocument);
				if (iframeDoc && iframeDoc.document)
					iframeDoc = iframeDoc.document;
				if(!iframeDoc) 
					iframeDoc = iframe;
				if(iframeDoc && iframeDoc.readyState && iframeDoc.readyState != 'complete' && iframeDoc.readyState != 4) {
					window.setTimeout(fName + "();", 1000);
				} else {
					self.iframeLoadCallback(iframe);
				}
			}; 
		})(this, this.iframeObject, this.iframePollCallbackName );
		
		this.iframePrepXHRPollCallbackName = "IFRAME_PREP_XHR" + AjaxRequest.iframeIdx.toString();
		// TODO: add onerror to handle error.
		window[this.iframePrepXHRPollCallbackName] = (function(self, iframeObject, fName) { 
			return function () {
				var iframe = document.getElementById(iframeObject.id);
				var iframeDoc = (iframe.contentWindow || iframe.contentDocument);
				if (iframeDoc && iframeDoc.document)
					iframeDoc = iframeDoc.document;
				if(!iframeDoc) 
					iframeDoc = iframe;
				if(iframeDoc && iframeDoc.readyState && iframeDoc.readyState != 'complete' && iframeDoc.readyState != 4) {
					window.setTimeout(fName + "();", 1000);
				} else {
					var iframeBody = iframeDoc.body;
					var form = AjaxRequest.getChildByTag(iframeBody, "form");
					//self.iframeLoadCallback(iframe);
					window.setTimeout(self.iframePollCallbackName + "();", 1000);
					form.submit();
				}
			}; 
		})(this, this.iframeObject, this.iframePrepXHRPollCallbackName );
		
		AjaxRequest.iframeIdx++;
		
		this.iframeCallback = null;
	}
	this.initializing = false;
};

AjaxRequest.prototype.msxml1ParseToTextIter = function(node) {
	var out = "";

	if(node)
	{
		if(node.type != 1)
		{
			if(node.tagName) {
				out += "<" + node.tagName;
			}
			if(AjaxRequest.hasmsxml1a) {
				for(var i = 0; node && node.attributes && i < node.attributes.length; i++) {
					var attribute = node.attributes.item(i);
					
					if(attribute) {
						out += "  " + attribute.name + "=\"" + attribute.value + "\"";
					}
				}
			} else {
				for(var i = 0; i < AjaxRequest.html_attributes.length; i++)
				{
					var attr = AjaxRequest.html_attributes[i];
					var val = node.getAttribute(attr);
					
					if(val) {
						out += "  " + attr + "=\"" + val + "\"";
					}
				}
			}
			
			if(node.tagName) {
				out += ">";
			}
			if(node.children) {
				for(var i = 0; i < node.children.length; i++) {
					
					out += this.msxml1ParseToTextIter(node.children.item(i));
				}
			}
			if(node.tagName) {
				out += "</" + node.tagName + ">";
			}
		} else {
			out += node.text;
		}
	}

	return out;
}

AjaxRequest.prototype.msxml1ParseToText = function(httprequest) {
	if(httprequest && httprequest.root) {
		var root = httprequest.root;
		return this.msxml1ParseToTextIter(root);
	}
	return "";
}

AjaxRequest.prototype.msxml1Callback = function() {
	var text = this.msxml1ParseToText(this.msxml1Obj);
	
	if(this.msxmlCallback) {
		this.msxmlCallback(text);
	}
};

AjaxRequest.prototype.iFrameCallback = function(html) {
	if(this.iframeCallback) {
		this.iframeCallback(html);
	}
};

AjaxRequest.prototype.finishLoadHTML = function(url, method, uriparameters, bodyparameters, headparams, callback) {
	if(this.xmlhttprequestObj) {
		//TODO: handle error.
		var keys = Object.keys(uriparameters);
		if(keys.length > 0) {
			url += "?";
			for(var ki = 0; ki < keys.length; ki++) {
				var key = keys[ki];
				var value = uriparameters[key];
				
				if(ki > 0) {
					url += "&";
				}
				url += key.toString() + "=";
				url += encodeURIComponent(value.toString());
			}
		}
		var params = JSON.stringify(bodyparameters);
		this.xmlhttprequestCallback = callback;
		this.xmlhttprequestObj.open(method, url, true);
		var headerkeys = Object.keys(headparams);
		if(headerkeys.length > 0) {
			for(var ki = 0; ki < headerkeys.length; ki++) {
				var key = headerkeys[ki];
				var value = headparams[key];
				
				this.xmlhttprequestObj.setRequestHeader(key, value);
			}
		}
		this.xmlhttprequestObj.setRequestHeader("Content-length", params.length);
		this.xmlhttprequestObj.send(params);
	} else if(this.msxml3Obj) {
		//TODO: handle error.
		var keys = Object.keys(uriparameters);
		if(keys.length > 0) {
			url += "?";
			for(var ki = 0; ki < keys.length; ki++) {
				var key = keys[ki];
				var value = uriparameters[key];
				
				if(ki > 0) {
					url += "&";
				}
				url += key.toString() + "=";
				url += encodeURIComponent(value.toString());
			}
		}
		var params = JSON.stringify(bodyparameters);
		this.msxmlCallback = callback;
		this.msxml3Obj.open(method, url, true);
		var headerkeys = Object.keys(headparams);
		if(headerkeys.length > 0) {
			for(var ki = 0; ki < headerkeys.length; ki++) {
				var key = headerkeys[ki];
				var value = headparams[key];
				
				this.msxml3Obj.setRequestHeader(key, value);
			}
		}
		this.msxml3Obj.setRequestHeader("Content-length", params.length);
		this.msxml3Obj.send(params);
	} else if(this.msxml2Obj) {
		//TODO: handle error.
		var keys = Object.keys(uriparameters);
		if(keys.length > 0) {
			url += "?";
			for(var ki = 0; ki < keys.length; ki++) {
				var key = keys[ki];
				var value = uriparameters[key];
				
				if(ki > 0) {
					url += "&";
				}
				url += key.toString() + "=";
				url += encodeURIComponent(value.toString());
			}
		}
		var params = JSON.stringify(bodyparameters);
		this.msxmlCallback = callback;
		this.msxml2Obj.open(method, url, true);
		var headerkeys = Object.keys(headparams);
		if(headerkeys.length > 0) {
			for(var ki = 0; ki < headerkeys.length; ki++) {
				var key = headerkeys[ki];
				var value = headparams[key];
				
				this.msxml2Obj.setRequestHeader(key, value);
			}
		}
		this.msxml2Obj.setRequestHeader("Content-length", params.length);
		this.msxml2Obj.send(params);
	} else if(this.msxml1Obj) {
		//TODO: handle error.
		var keys = Object.keys(uriparameters);
		if(keys.length > 0) {
			url += "?";
			for(var ki = 0; ki < keys.length; ki++) {
				var key = keys[ki];
				var value = uriparameters[key];
				
				if(ki > 0) {
					url += "&";
				}
				url += key.toString() + "=";
				url += encodeURIComponent(value.toString());
			}
		}
		this.msxmlCallback = callback;
		this.msxml1Obj.URL = url;
		window.setTimeout(this.msxml1PollCallbackName + "();", 0);
	} else if(this.iframeObject) {
		//TODO: handle error.
		
		var iframe = document.getElementById(this.iframeObject.id);
		var formmethod="get";
		if(method.toLowerCase() == "put" || method.toLowerCase() == "post" || method.toLowerCase() == "patch") {
			 formmethod="post";
		}
		if(!/^[0-9A-Za-z-]*:?\/\//.test(url)) {
			url = location.protocol + '//' + location.host + "/" + url;
		}
		var src =	'javascript:void(' +
						'(function(){' +
							'var script = document.createElement("script");' +
							'script.innerHTML = "(function() {' +
								'document.open();' +
								'document.domain=\\"' + document.domain + '\\";' +
								'document.close();})();";' +
							'document.write("' +
								'<head>" + script.outerHTML + "';
		if(headparams) {
			var keys = Object.keys(headparams);
			for(var ki = 0; ki < keys.length; ki++)
			{
				var key = keys[ki];
				var value = headparams[key];
				src += '<meta http-equiv=\\"' + key.toString() + '\\" content=\\"' + value.toString() + '\\"/>';
			}
		}
		src +=					'</head>' +
								'<body>' + 
									'<form action=\\"' + url + '\\" method=\\"' + formmethod + '\\" target=\\"' + this.iframeObject.id + '\\">';
		if(method.toLowerCase() != "post" && method.toLowerCase() != "get") {
			src += '<input type=\\"hidden\\" name=\\"_method\\" value=\\"' + method + '\\"/>';
		}
		if(uriparameters) {
			var keys = Object.keys(uriparameters);
			for(var ki = 0; ki < keys.length; ki++)
			{
				var key = keys[ki];
				var value = uriparameters[key];
				src += '<input type=\\"hidden\\" name=\\"' + key.toString() + '\\" value=\\"' + value.toString() + '\\"/>';
			}
		}
		if(bodyparameters) {
			var keys = Object.keys(bodyparameters);
			for(var ki = 0; ki < keys.length; ki++)
			{
				var key = keys[ki];
				var value = bodyparameters[key];
				src += '<input type=\\"hidden\\" name=\\"' + key.toString() + '\\" value=\\"' + value.toString() + '\\"/>';
			}
		}
		
		src +=						'</form>' + 
								'</body>' +
							'");' +
						'})()' +
					')';
		document.getElementById(this.iframeObject.id).src = src;
		
		this.iframeCallback = callback;
		//AjaxRequest.bindEvent(this.iframeObject, 'load', this.iframeLoadCallback);
		//window.setTimeout(this.iframePollCallbackName + "();", 1000);
		window.setTimeout(this.iframePrepXHRPollCallbackName + "();", 1000);
		
		//this.iframeObject.src = url;
	}
};

AjaxRequest.prototype.loadHTML = function(url, method, uriparameters, bodyparameters, headparams, callback) {
	window[this.loadHTMLCallbackName] = (function(self, cururl, curmethod, cururiparameters, curbodyparameters, curheadparams, curcallback) { 
		return function() {
			if(AjaxRequest.initializing || self.initializing) {
				window.setTimeout(self.loadHTMLCallbackName + "();", 100);
			} else {
				self.finishLoadHTML(cururl, curmethod, cururiparameters, curbodyparameters, curheadparams, curcallback);
			}
		};
	})(this, url, method, uriparameters, bodyparameters, headparams, callback);
	window.setTimeout(this.loadHTMLCallbackName + "();", 100);
};

function AjaxRequest_testend() {
	if(AjaxRequest.windowonerror) {
		window.onerror = AjaxRequest.windowonerror;
	} else {
		window.onerror = null;
	}
	AjaxRequest.initializing = false;
}

function AjaxRequest_testXMLHttpRequest() {
	window.setTimeout('AjaxRequest_testend();', 0);
	if(window.XMLHttpRequest) {
		var xmlhttprequest = new XMLHttpRequest();
		if(xmlhttprequest) {
			AjaxRequest.hasxmlhttprequest = true;
		}
	}
}

function AjaxRequest_testMSXML1() {
	window.setTimeout('AjaxRequest_testXMLHttpRequest();', 0);
	if(window.ActiveXObject) {
		var msxml1 = new ActiveXObject("MSXML");
		if(msxml1) {
			AjaxRequest.hasmsxml1 = true;
		}
	}
}

function AjaxRequest_testMSXML1a() {
	window.setTimeout('AjaxRequest_testMSXML1();', 0);
	if(window.ActiveXObject) {
		var msxml1 = new ActiveXObject("MSXML");
		if(msxml1) {
			if(msxml1.async === false || msxml1.async) {
				AjaxRequest.hasmsxml1a = true;
			}
		}
	}
}

function AjaxRequest_testMSXML2() {
	window.setTimeout('AjaxRequest_testMSXML1a();', 0);
	if(window.ActiveXObject) {
		var msxml2 = new ActiveXObject("Microsoft.XMLHTTP");
		if(msxml2) {
			AjaxRequest.hasmsxml2 = true;
		}
	}
}

function AjaxRequest_testMSXML3Plus() {
	window.setTimeout('AjaxRequest_testMSXML2();', 0);
	if(window.ActiveXObject) {
		var msxml3 = new ActiveXObject("MSXML2.XMLHTTP");
		if(msxml3) {
			AjaxRequest.hasmsxml3 = true;
		}
	}
}

(function () {
  // Static initialization code
  AjaxRequest.objIdx = 0;
  AjaxRequest.iframeIdx = 0;
  AjaxRequest.msxmlIdx = 0;
  AjaxRequest.initializing = true;
  AjaxRequest.hasmsxml1 = false;
  AjaxRequest.hasmsxml1a = false;
  AjaxRequest.hasmsxml2 = false;
  AjaxRequest.hasmsxml3 = false;
  AjaxRequest.hasxmlhttprequest = false;

  // IE4 doesn't have try {} catch {},  because... IE... so use this janky workarround kludge instead...
  if(window && window.onerror) {
    AjaxRequest.windowonerror = window.onerror;
  } else {
    AjaxRequest.windowonerror = null;
  }
  
  window.onerror = function() {
    return true;
  };

  window.setTimeout('AjaxRequest_testMSXML3Plus();', 0);
  //window.setTimeout('AjaxRequest_testend();', 0);
})();
