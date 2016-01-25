(function(){

var robotElement = '<div class = "character-robot" style = "maxHeight: 100%; height:100%; width: 100%; maxWidth: 100%;"><img src="/playground/images/robot.png" style = "maxHeight: 100%; height:100%; width: 100%; maxWidth: 100%;"></div>';

function initialCanvas(width, height) {
	for(var i = 0 ; i < height; i++) { 
		$(".robot-playground").append('<div class = "robot-playground-row"></div>');


	}
	$(".robot-playground-row").each(function(index) {
		var row = $(this);
		//row.css('float', 'left');
		  for (var i = 0; i < width; i++) {

	    	var cell = $('<div class = "robot-playground-cell"> </div>');
	    		if(i == 0) {
	    			$(cell).append('<div style = "position:absolute">' + (index + 1) + '</div>');	
		  	}
	    	cell.css( 'width', ( row.width()/width) + 'px' );

	    	//cell.css( 'maxWidth', ( row.width()/ width) + 'px' );
	    	cell.css( 'height', ( row.width() / width) + 'px' );
	    	//cell.css( 'maxHeight', ( row.width() / width) + 'px' );
		    cell.css( 'float', 'left');
	    	cell.css( 'border', '1px solid #ddd');
	    	cell.css('background-color', 'white');
	    	row.css( 'maxHeight', ( row.width() / width) + 'px' );
	    	row.append(cell);
	    }
	});
}
function initialCharacters(x, y) {
	var rows = $(".robot-playground-row");
	var robotCell = $($(rows[x]).children()[y]);
	var robotCharacter =  $(robotElement);
	robotCharacter.data('coordinateX', x);
	robotCharacter.data('coordinateY', y);
	robotCell.append(robotCharacter);
}
$( document ).ready(function() {
    initialCanvas(8, 6);
    initialCharacters(3, 2);
});
})();
