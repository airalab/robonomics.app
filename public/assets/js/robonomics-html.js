
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
/*
	Dependencies
	0-inview.js
*/

window.addEventListener('load', function(){

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
var 
	selector = 'on-toggle',
	onclose  = 'on-close',
	classOpen = 'open',
	classSwitchOn = 'active';


function init(){

	var e = document.querySelectorAll('.js-sidebar-link');
	var c = document.querySelectorAll('.js-sidebar-content');

	e.forEach(function(i){
		i.addEventListener("click", function(event){
			event.preventDefault();

			var
				t = this,
				contentID = t.getAttribute(selector);

			e.forEach(function(i){
				if (i != t){
					i.classList.remove(classSwitchOn);
				}
				else{
					if (t.classList.contains(classSwitchOn))
						t.classList.remove(classSwitchOn);
					else
						t.classList.add(classSwitchOn);
				}
			});


			c.forEach(function(i){

				var id = '#'+i.id;

				if (id != contentID ){
					i.classList.remove(classOpen);
				}
				else{
					if (i.classList.contains(classOpen))
						i.classList.remove(classOpen);
					else
						i.classList.add(classOpen);

				}
			});


		});
	});
}


window.addEventListener('load', init, false);
/*
	Dependencies
	0-cookie.js
	0-show.js
*/

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