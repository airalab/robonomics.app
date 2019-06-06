

function windowSlideAct(o, hide){
	content = o.closest('.window').children[1];
	w = o.closest('.window');

	if ( hide ){
  		content.style.display = 'none';
  		o.innerHTML = '+';

  		if(w.getAttribute('id')){
  			date = new Date(new Date().getTime() + 3600 * 1000 * 24 * 365);
			document.cookie = w.getAttribute('id')+'=hide; expires=' + date.toUTCString();
		}
  	}
  	else{
  		content.style.display = 'block';
  		o.innerHTML = '–';

  		if(w.getAttribute('id')){
  			date = new Date(new Date().getTime() + 3600 * 1000 * 24 * 365);
			document.cookie = w.getAttribute('id')+'=show; expires=' + date.toUTCString();
		}
  	}
}


function windowSlide(){
	var content, wID, hide,
	w = document.querySelectorAll('.window-head-toggle');

	if(w){

		for (var i = 0; i < w.length; i++) {

			if( w[i].closest('.window').getAttribute('id'))
				{
					wID = w[i].closest('.window').getAttribute('id');
			  		if(getCookie(wID)){
			  			if(getCookie(wID) == 'hide') { hide = true; }
			  			if(getCookie(wID) == 'show') { hide = false; }

			  			windowSlideAct(w[i], hide);
			  		}
			  	}

			w[i].addEventListener("click", function(event){
		  		event.preventDefault();

		  		content = this.closest('.window').children[1];

			  	// func isVisible from 0-show.js
			  	if(isVisible(content)){ hide = true; }
			  	else{ hide = false; }

			  	windowSlideAct(this, hide);

			});
		}
	}
}


window.addEventListener('load', windowSlide, false);
//  Import support https://stackoverflow.com/questions/13673346/supporting-both-commonjs-and-amd
(function(name, definition) {
    if (typeof module !== "undefined") { module.exports = definition(); }
    else if (typeof define === "function" && typeof define.amd === "object") { define(definition); }
    else { this[name] = definition(); }
}("clipboard", function() {
  if (typeof document === 'undefined' || !document.addEventListener) {
    return null;
  }

  var clipboard = {};

  clipboard.copy = (function() {
    var _intercept = false;
    var _data = null; // Map from data type (e.g. "text/html") to value.
    var _bogusSelection = false;

    function cleanup() {
      _intercept = false;
      _data = null;
      if (_bogusSelection) {
        window.getSelection().removeAllRanges();
      }
      _bogusSelection = false;
    }

    document.addEventListener("copy", function(e) {
      if (_intercept) {
        for (var key in _data) {
          e.clipboardData.setData(key, _data[key]);
        }
        e.preventDefault();
      }
    });

    // Workaround for Safari: https://bugs.webkit.org/show_bug.cgi?id=156529
    function bogusSelect() {
      var sel = document.getSelection();
      // If "nothing" is selected...
      if (!document.queryCommandEnabled("copy") && sel.isCollapsed) {
        // ... temporarily select the entire body.
        //
        // We select the entire body because:
        // - it's guaranteed to exist,
        // - it works (unlike, say, document.head, or phantom element that is
        //   not inserted into the DOM),
        // - it doesn't seem to flicker (due to the synchronous copy event), and
        // - it avoids modifying the DOM (can trigger mutation observers).
        //
        // Because we can't do proper feature detection (we already checked
        // document.queryCommandEnabled("copy") , which actually gives a false
        // negative for Blink when nothing is selected) and UA sniffing is not
        // reliable (a lot of UA strings contain "Safari"), this will also
        // happen for some browsers other than Safari. :-()
        var range = document.createRange();
        range.selectNodeContents(document.body);
        sel.removeAllRanges();
        sel.addRange(range);
        _bogusSelection = true;
      }
    }

    return function(data) {
      return new Promise(function(resolve, reject) {
        _intercept = true;
        if (typeof data === "string") {
          _data = {"text/plain": data};
        } else if (data instanceof Node) {
          _data = {"text/html": new XMLSerializer().serializeToString(data)};
        } else {
          _data = data;
        }

        function triggerCopy(tryBogusSelect) {
          try {
            if (document.execCommand("copy")) {
              // document.execCommand is synchronous: http://www.w3.org/TR/2015/WD-clipboard-apis-20150421/#integration-with-rich-text-editing-apis
              // So we can call resolve() back here.
              cleanup();
              resolve();
            }
            else {
              if (!tryBogusSelect) {
                bogusSelect();
                triggerCopy(true);
              } else {
                cleanup();
                throw new Error("Unable to copy. Perhaps it's not available in your browser?");
              }
            }
          } catch (e) {
            cleanup();
            reject(e);
          }
        }
        triggerCopy(false);

      });
    };
  })();

  clipboard.paste = (function() {
    var _intercept = false;
    var _resolve;
    var _dataType;

    document.addEventListener("paste", function(e) {
      if (_intercept) {
        _intercept = false;
        e.preventDefault();
        var resolve = _resolve;
        _resolve = null;
        resolve(e.clipboardData.getData(_dataType));
      }
    });

    return function(dataType) {
      return new Promise(function(resolve, reject) {
        _intercept = true;
        _resolve = resolve;
        _dataType = dataType || "text/plain";
        try {
          if (!document.execCommand("paste")) {
            _intercept = false;
            reject(new Error("Unable to paste. Pasting only works in Internet Explorer at the moment."));
          }
        } catch (e) {
          _intercept = false;
          reject(new Error(e));
        }
      });
    };
  })();

  // Handle IE behaviour.
  if (typeof ClipboardEvent === "undefined" &&
      typeof window.clipboardData !== "undefined" &&
      typeof window.clipboardData.setData !== "undefined") {

    /*! promise-polyfill 2.0.1 */
    (function(a){function b(a,b){return function(){a.apply(b,arguments)}}function c(a){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof a)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],i(a,b(e,this),b(f,this))}function d(a){var b=this;return null===this._state?void this._deferreds.push(a):void j(function(){var c=b._state?a.onFulfilled:a.onRejected;if(null===c)return void(b._state?a.resolve:a.reject)(b._value);var d;try{d=c(b._value)}catch(e){return void a.reject(e)}a.resolve(d)})}function e(a){try{if(a===this)throw new TypeError("A promise cannot be resolved with itself.");if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void i(b(c,a),b(e,this),b(f,this))}this._state=!0,this._value=a,g.call(this)}catch(d){f.call(this,d)}}function f(a){this._state=!1,this._value=a,g.call(this)}function g(){for(var a=0,b=this._deferreds.length;b>a;a++)d.call(this,this._deferreds[a]);this._deferreds=null}function h(a,b,c,d){this.onFulfilled="function"==typeof a?a:null,this.onRejected="function"==typeof b?b:null,this.resolve=c,this.reject=d}function i(a,b,c){var d=!1;try{a(function(a){d||(d=!0,b(a))},function(a){d||(d=!0,c(a))})}catch(e){if(d)return;d=!0,c(e)}}var j=c.immediateFn||"function"==typeof setImmediate&&setImmediate||function(a){setTimeout(a,1)},k=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};c.prototype["catch"]=function(a){return this.then(null,a)},c.prototype.then=function(a,b){var e=this;return new c(function(c,f){d.call(e,new h(a,b,c,f))})},c.all=function(){var a=Array.prototype.slice.call(1===arguments.length&&k(arguments[0])?arguments[0]:arguments);return new c(function(b,c){function d(f,g){try{if(g&&("object"==typeof g||"function"==typeof g)){var h=g.then;if("function"==typeof h)return void h.call(g,function(a){d(f,a)},c)}a[f]=g,0===--e&&b(a)}catch(i){c(i)}}if(0===a.length)return b([]);for(var e=a.length,f=0;f<a.length;f++)d(f,a[f])})},c.resolve=function(a){return a&&"object"==typeof a&&a.constructor===c?a:new c(function(b){b(a)})},c.reject=function(a){return new c(function(b,c){c(a)})},c.race=function(a){return new c(function(b,c){for(var d=0,e=a.length;e>d;d++)a[d].then(b,c)})},"undefined"!=typeof module&&module.exports?module.exports=c:a.Promise||(a.Promise=c)})(this);

    clipboard.copy = function(data) {
      return new Promise(function(resolve, reject) {
        // IE supports string and URL types: https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
        // We only support the string type for now.
        if (typeof data !== "string" && !("text/plain" in data)) {
          throw new Error("You must provide a text/plain type.");
        }

        var strData = (typeof data === "string" ? data : data["text/plain"]);
        var copySucceeded = window.clipboardData.setData("Text", strData);
        if (copySucceeded) {
          resolve();
        } else {
          reject(new Error("Copying was rejected."));
        }
      });
    };

    clipboard.paste = function() {
      return new Promise(function(resolve, reject) {
        var strData = window.clipboardData.getData("Text");
        if (strData) {
          resolve(strData);
        } else {
          // The user rejected the paste request.
          reject(new Error("Pasting was rejected."));
        }
      });
    };
  }

  return clipboard;
}));
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
/*
Took on  https://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
demo - http://jsfiddle.net/W33YR/411/
*/


var visibleY = function(el){
  if(el){
    var
      rect = el.getBoundingClientRect(),
      top = rect.top,
      height = rect.height,
      el = el.parentNode;

      do {
        rect = el.getBoundingClientRect();
        if (top <= rect.bottom === false) return false;

        // Check if the element is out of view due to a container scrolling
        if ((top + height) <= rect.top) return false;
        el = el.parentNode;
      } while (el != document.body);

      // Check its within the document viewport
      return top <= document.documentElement.clientHeight;
      }
};


/* Usage */
// IfInView();
// document.addEventListener('scroll', IfInView);
// document.addEventListener('resize', IfInView);

function isVisible(element){
	if (element.offsetWidth > 0 && element.offsetHeight > 0)
		return true;
}


var show = function(link, block, textShow, textHide){

	var infoblock = document.querySelectorAll(block);

	for (var j = 0; j < infoblock.length; j++) {
		if (isVisible(infoblock[j])){
			infoblock[j].style.display = 'none';
			if(textHide) link.innerHTML = textHide;
		}
		else{
			infoblock[j].style.display = 'block';
			if(textShow) link.innerHTML = textShow;
		}
	}

}
var showSorted = function(tag, tagLink, tagSec, active){

	var sec = document.querySelectorAll('[data-' + tagSec + ']');
	var link = document.querySelectorAll('[data-' + tagLink + ']');

	for (var i = 0; i < sec.length; i++) {

		sec[i].style.display = 'block';

		if( (tag != 0) ){

			if( sec[i].getAttribute('data-' + tagSec) != tag ){
				sec[i].style.display = 'none';
			}
		}
	}
}

var sort = function(tagLink, tagSec, active){

	var sec = document.querySelectorAll('[data-' + tagSec + ']');
	var link = document.querySelectorAll('[data-' + tagLink + ']');

	for (var i = 0; i < link.length; i++) {

		link[i].addEventListener('click', function(){

			for (var j = 0; j < link.length; j++) {
				link[j].classList.remove(active);
			}

			this.classList.add(active);
			showSorted( this.getAttribute('data-' + tagLink), tagLink, tagSec, active);
		});
	}


}
window.addEventListener('load', function(){

	/*
	Check elemen in view
	0-inview.js
	*/
	function IfInView(){
		var
			el = document.querySelectorAll('.js-checkInView'),
			classview = 'isInView';

		el.forEach(function(item){
			if(visibleY(item))
				item.classList.add(classview);
		});
	}

	IfInView();
	document.addEventListener('scroll', IfInView);
	document.addEventListener('resize', IfInView);

}, false);
window.addEventListener('load', function(){

	var sidebar = document.querySelector('.sidebar'),
		classClose = 'closed',
		classOpen = 'opened',
		date;

	document.querySelector('.sidebar-toggle').addEventListener("click", function(event){
	  event.preventDefault();

	  if(sidebar.classList.contains(classClose)){
	  	sidebar.classList.remove(classClose);
	  	sidebar.classList.add(classOpen);

	  	date = new Date(new Date().getTime() + 3600 * 1000 * 24 * 365);
		document.cookie = 'sidebarTog=open; expires=' + date.toUTCString();
	  }
	  else{
	  	sidebar.classList.add(classClose);
	  	sidebar.classList.remove(classOpen);
	  	date = new Date(new Date().getTime() + 3600 * 1000 * 24 * 365);
		document.cookie = 'sidebarTog=close; expires=' + date.toUTCString();
	  }
	});

}, false);



var sidebarDetect = function (event) {
	var sidebar = document.querySelector('.sidebar'),
		classClose = 'closed',
		cookie;

	cookie = getCookie('sidebarTog');
	console.log('sidebar status – '+cookie);

	if(window.innerWidth > 1280){

		if(!cookie || cookie == 'open'){
			sidebar.classList.remove(classClose);
		}
		else{
			sidebar.classList.add(classClose);
		}
	}
	else{
		sidebar.classList.add(classClose);
	}
};

window.addEventListener('load', sidebarDetect, false);
window.addEventListener('resize', sidebarDetect, false);
