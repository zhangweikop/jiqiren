function makeProgramWindowView(rootDom){
	var rootContainer = $(rootDom);
	var programMenu = 'lowlevel-command-gallery';
	var programEditor = 'lowlevel-command-editor';
	var menduWindow;
	var editorWindow;
	function initial() {
		rootContainer.append('<div class = "' + programMenu + ' col-xs-6 col-sm-4 col-md-4"></div><div class = "' + programEditor + ' col-xs-6 col-sm-8 col-md-8"></div>');
		rootContainer.css( { 'max-height' : (self.innerHeight-rootContainer.offset().top) + 'px'});
	
		menduWindow = rootContainer.find('.' + programMenu)[0];
		editorWindow = rootContainer.find('.' + programEditor)[0];
		for(var i = 0; i < 40; i++) {
			$(menduWindow).append('<div>Move Instruction</div>');
		}
	//	$(menduWindow).css({ 'height' : '100%', 'overflow': 'auto'});


		//$(self).on("resize", resizeThrottler);

	    var resizeTimeout;
	    function resizeThrottler() {
	    	// ignore resize events as long as an actualResizeHandler execution is in the queue
	    	if ( !resizeTimeout ) {
	      		resizeTimeout = setTimeout(function() {
	        	resizeTimeout = null;
	        	actualResizeHandler();	     
	       		// The actualResizeHandler will execute at a rate of 15fps
	       		}, 20);
	    	}
	  	}

	    function actualResizeHandler() {
	    	// handle the resize event
	    //	rootContainer.css('height', rootContainer.parent().width());
	    	rootContainer.css( { 'max-height' : (self.innerHeight-rootContainer.offset().top) + 'px'});
	  	}
	}
	initial(rootDom);
	return {
		rootElement: rootDom
	};
}