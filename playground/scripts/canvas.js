function makeMyBoardView(rootDom, rows, columns){
	var classRobotPlaygroundRow = 'robot-playground-row';
	var classRobotPlaygroundCell = 'robot-playground-cell';
	var board = [];
	var boardObjects = {};
	var rootContainer = $(rootDom);
	function initial(rootDom, height, width) {
		var playgroundClearFix = '<div style="clear:both"></div>';	

		board = new Array(height);
		for (var i = 0; i < height; i++) {
		  board[i] = new Array(width);
		  for (var j = 0; j < width; j++) {
		    board[i][j] = {};
		  }
		}
		 rootContainer.css('width', rootContainer.parent().width());
		for(var i = 0 ; i < height; i++) { 
			rootContainer.append('<div  style = "width:100%" class = "' + classRobotPlaygroundRow + '"></div>');
		}
		rootContainer.children().each(function(rowIndex) {

			var row = $(this);
			for (var colIndex = 0; colIndex < width; colIndex++) {
		    	var cell = $('<div class = "' + classRobotPlaygroundCell + '"> </div>');
		    	if(colIndex == 0) {
		    		cell.append('<div style = "position:absolute">' + (rowIndex + 1) + '</div>');	
			  	} 
	    		var size= { 
					   
	    				'width' : parseInt( row.width()/columns) + 'px',
	    				'height' : parseInt( row.width() / columns ) + 'px'
	    		};
			    cell.css(size);
		    	row.css( 'maxHeight', ( row.width() / width) + 'px' );
		    	board[rowIndex][colIndex] = cell[0];
		    	row.append(cell);
		    	if (colIndex == width-1) {
		    		row.append(playgroundClearFix);
		    	}
		    }
		});
		

 	    $(window.self).on("resize", resizeThrottler);

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
	    	rootContainer.css('width', rootContainer.parent().width());
	    	rootContainer.children('.' + classRobotPlaygroundRow).each( function(index){
				var row = $(this);
				var size= { 
		    				'width' : parseInt( row.width()/columns) + 'px',
		    				'height' : parseInt( row.width() / columns ) + 'px'
		    			};
				row.children('.' + classRobotPlaygroundCell).css(size);

	    	})
	  	}
	}


	function createElement(x, y, elementName, element) {
		var elementContainer = board[y][x];
		var newElement;
		if (!!elementName && !!element) {
			if (boardObjects.hasOwnProperty(elementName)) {
				return false;
			}
			newElement = $(element);
			$(elementContainer).append(newElement);
			boardObjects[elementName] = newElement;
			return true;
		} 
		return false;
	}

	function moveElement(newx, newy, objectName, time, cb) {
		if (newx >= columns || newy >= rows) {
			return false;
		}
		var newContainer = board[newy][newx];
		var element = boardObjects[objectName];
		var startPoint = $(element).offset();
 		var endPoint = $(newContainer).offset();
 		var xOffset = endPoint.left - startPoint.left;
 		var yOffset = endPoint.top - startPoint.top;
 		var timeInterval = 30;
 		var stepx = xOffset/(time/timeInterval);
 		var stepy = yOffset/(time/timeInterval);
		function translate(i, j, xOffset, yOffset){ 
			var x = i + stepx;
			var y = j + stepy;
			if ( (x - xOffset)*(i - xOffset) <=0) {
				x = xOffset;
			}
			if ((y - yOffset)*(j - yOffset) <=0 ) {
				y = yOffset;
			}
			if (x != xOffset || y != yOffset) {
				$(element).css({transform: 'translate(' + x + 'px,' + y + 'px)'});
				setTimeout(function(){
					translate(x, y, xOffset, yOffset);
				}, timeInterval);
			} else {
				$(element).css({transform: 'none'});
				$(element).appendTo($(newContainer));
				if(cb) {
					cb();
				}
			}			
		}
		translate(0, 0, xOffset, yOffset);
		return true;
	}
	initial(rootDom, rows, columns);
	return {
		rootElement: rootDom,
		board: board,
		createElementAtBoard: createElement,
		boardObjects: boardObjects,  
		MoveElementInsideBoard: moveElement
	}
}
