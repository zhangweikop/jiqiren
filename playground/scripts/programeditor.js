function makeProgramWindowView(rootDom){
	var supportedCommands= [{name: 'MoveForward'}];
	var rootContainer = $(rootDom);
	var programMenu = 'lowlevel-command-gallery';
	var programEditor = 'lowlevel-command-editor';
	var menduWindow;
	var editorWindow;
	function initial() {
		rootContainer.append('<div class = "' + programMenu + ' col-xs-6 col-sm-4 col-md-4"></div><div class = "' + programEditor + ' col-xs-6 col-sm-8 col-md-8"></div>');
		rootContainer.css( { 'height' : (window.self.innerHeight-rootContainer[0].getBoundingClientRect().top) + 'px'});
	
		menduWindow = rootContainer.find('.' + programMenu)[0];
		editorWindow = rootContainer.find('.' + programEditor)[0];
		$(menduWindow).css({ 'padding': 'initial', 'box-sizing': 'border-box', 'border': '1px solid #ddd','height' : '100%', 'overflow': 'auto'});

		for(var i = 0; i < supportedCommands.length; i++) {
			var command = '<div style="width:100%">' + '<a class = "command-btn" ><span>'+ supportedCommands[i].name + '</span></a>'+ '</div>';

			//box-shadow: inset 1px 1px 0 rgba(0,0,0,0.1),inset 0 -1px 0 rgba(0,0,0,0.07);
			$(menduWindow).append(command);
		}



		$(window.self).on("resize scroll", resizeThrottler);

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
	    	rootContainer.css( { 'height' : (self.innerHeight-rootContainer[0].getBoundingClientRect().top) + 'px'});
	  	}
	}
	initial(rootDom);
	return {
		rootElement: rootDom
	};
}