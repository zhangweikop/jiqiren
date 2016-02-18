function makeProgramWindowView(rootDom, programMenu, programEditor, supportedCommands){
	var rootContainer = $(rootDom);
	
	var classKeyword = 'command-item';
	var blockKeyword = 'command-block';
	var menduWindow;
	var editorWindow;
	function initial() {
		rootContainer.append('<div class = "' + programMenu + ' col-xs-6 col-sm-4 col-md-4"></div><div class = "' + programEditor + ' col-xs-6 col-sm-8 col-md-8"></div>');

		rootContainer.css({'height' : (window.self.innerHeight-rootContainer[0].getBoundingClientRect().top) + 'px'});
	
		menduWindow = rootContainer.find('.' + programMenu)[0];
		editorWindow = rootContainer.find('.' + programEditor)[0];
		editorWindow.dataset.firstClassKeyword = classKeyword;
		editorWindow.dataset.blockClassKeyword = blockKeyword;

		//$(menduWindow).css({ });
		 
		//$(editorWindow).css({ 'padding': 'initial', 'box-sizing': 'border-box', 'border': '1px solid #ddd','height' : '100%', 'overflow': 'auto'});

		for(var i = 0; i < supportedCommands.length; i++) {

			var html;
			var commandObject = supportedCommands[i];
			var displayText = '<span>'+ commandObject.name + '</span>';
			if (commandObject.parameters) {
				for (var j = 0; j < commandObject.parameters.length; j++) {
					var parameter = commandObject.parameters[j];
					if(parameter.text) {
						displayText += '<span>' + parameter.text + '</span>';
					} else if (parameter.input){
						displayText += '<input type = "text" class="command-parameter-input" placeholder = "' + parameter.default + '">';
					}
				}
			}
			//html = '<div class = "'+ classKeyword +'" draggable = "true" style="width:100%">' + '<div class = "command-btn" >' + displayText + '</div>'+ '</div>';

			 html = '<div class =" command-btn  '+ classKeyword +'" draggable = "true" style="width:100%">' + displayText +  '</div>';
			//box-shadow: inset 1px 1px 0 rgba(0,0,0,0.1),inset 0 -1px 0 rgba(0,0,0,0.07);	
			var domNode = $(html);
			if (commandObject.block) {
				domNode.append('<span>{</span><div class = "command-block" style = "margin-left:10%"></div><span>}</span>');
				domNode[0].dataset.hasBlock= true;
			}
			$(menduWindow).append(domNode);
			domNode[0].dataset.commandName = JSON.stringify(commandObject.name);	
			
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

	function handleDragStart(e) {

		// Target (this) element is the source node.
	//	this.style.opacity = '1.0';
		dragSrcEl = this;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.outerHTML);
	}
	
	function handleDragOVer(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}

		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
		return false;
	}
	function handleDropInBlock(e) {
		 if (e.stopPropagation) {
	   		e.stopPropagation(); // Stops some browsers from redirecting.
	  	}	
	    // Set the source column's HTML to the HTML of the column we dropped on.
	    var content = e.dataTransfer.getData('text/html');
	    if(!content) {
	    	return false;
	    }
	    var newElement = $(content);
	    if (newElement[0].dataset.hasBlock) {
		    newElement[0].addEventListener('drop', handleDropInBlock, false);
		}
	    $(this).children('.command-block').append(newElement);
  		return false;
	}
	function handleDrop(e) {

	    if (e.stopPropagation) {
	   		e.stopPropagation(); // Stops some browsers from redirecting.
	  	}	
	    // Set the source column's HTML to the HTML of the column we dropped on.
	    var content = e.dataTransfer.getData('text/html');
	    if (!content) {
	    	return false;
	    }
	    var newElement = $(content);
	    if (newElement[0].dataset.hasBlock) {
		    newElement[0].addEventListener('drop', handleDropInBlock, false);
		}
	    $(this).append(newElement);
  		return false;
	}
	//
	function bindDragDropEvents() {
		rootContainer.find('.command-item').each( function(index){
			var item = $(this)[0];
			item.addEventListener('dragstart', handleDragStart, false);
		//	item.addEventListener('dragenter', handleDragEnter, false);
		//	item.addEventListener('dragleave', handleDragLeave, false);
		});
		rootContainer[0].addEventListener('dragover', handleDragOVer, false);
		$(editorWindow)[0].addEventListener('drop', handleDrop, false);
	}
	initial(rootDom);
	bindDragDropEvents();
	return {
		rootElement: rootDom
	};
}