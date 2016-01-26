function PlayGroundCanvasView(canvasWidth, canvasHeight){
	var classRobotPlayground    = 'robot-playground';
	var classRobotPlaygroundRow = 'robot-playground-row';
	var classRobotPlaygroundCell = 'robot-playground-cell';
	var classRobotPlaygroundCharacter = 'robot-playground-character'
	var robotElement = '<div class = "' + classRobotPlaygroundCharacter + '" style = "maxHeight: 100%; height:100%; width: 100%; maxWidth: 100%;">'+
									'<img src="/playground/images/robot.png" style = "maxHeight: 100%; height:100%; width: 100%; maxWidth: 100%;">'
									+'</div>';
	var playgroundClearFix = '<div style="clear:both"></div>';								
	function initialCanvas(width, height) {
		for(var i = 0 ; i < height; i++) { 

			$('.' + classRobotPlayground).css('width', $('.' + classRobotPlayground).parent().width());
			$('.' + classRobotPlayground).append('<div class = "' + classRobotPlaygroundRow + '"></div>');

		}
		$('.' + classRobotPlaygroundRow).each(function(index) {
				var row = $(this);
			  for (var i = 0; i < width; i++) {

		    	var cell = $('<div class = "' + classRobotPlaygroundCell + '"> </div>');
		    	if(i == 0) {
		    		$(cell).append('<div style = "position:absolute">' + (index + 1) + '</div>');	
			  	} 
		    	cell.css( 'width', ( row.width()/width) + 'px' );
		    	cell.css( 'maxWidth', ( row.width()/width) + 'px' );
		    	cell.css( 'maxHeight', ( row.width()/width) + 'px' );

		    	//cell.css( 'maxWidth', ( row.width()/ width) + 'px' );
		    	cell.css( 'height', ( row.width() / width) + 'px' );
		    	//cell.css( 'maxHeight', ( row.width() / width) + 'px' );
			    cell.css( 'float', 'left');
		    	cell.css( 'border', '1px solid #ddd');
		    	cell.css('background-color', 'white');
		    	row.css( 'maxHeight', ( row.width() / width) + 'px' );

		    	row.append(cell);
		    	if (i == width-1) {
		    		row.append(playgroundClearFix);
		    	}
		    }
		});
	}
	function initialCharacters(x, y) {
		var rows = $('.' + classRobotPlaygroundRow);
		var robotCell = $($(rows[x]).children()[y]);
		var robotCharacter =  $(robotElement);
		robotCharacter.data('coordinateX', x);
		robotCharacter.data('coordinateY', y);
		robotCell.append(robotCharacter);
	}
	
	initialCanvas(canvasWidth, canvasHeight);
	initialCharacters(3, 2);
	
//handle resize for the playground canvas
	(function() {

	  $(window).on("resize", resizeThrottler);

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
	    $('.' + classRobotPlayground).css('width', $('.' + classRobotPlayground).parent().width());
	    $('.' + classRobotPlaygroundRow).each( function(index){
			var row = $(this);
			row.children('.' + classRobotPlaygroundCell).css( {'width' : ( row.width()/canvasWidth) + 'px', 'height' : ( row.width() / canvasWidth ) + 'px'});
	    })
	  }
	}());
}
