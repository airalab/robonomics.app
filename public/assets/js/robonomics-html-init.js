document.addEventListener('DOMContentLoaded',function(){
  

	//popper.js, tooltip.js
  	var
      reference = document.querySelectorAll('.js-tooltip');
      // parser = new DOMParser();

  	if ( reference )
  		{
  			reference.forEach(function(e){
  				new Tooltip(
				  	e,
				  	{
              // title: parser.parseFromString(e.getAttribute('data-tooltip'), "text/xml"),
					    title: e.getAttribute('data-tooltip'),
					    placement: 'auto',
              container: 'body'
				  	});
  			});

  		}

});