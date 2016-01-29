//viewcontroller and view are view realted
function ViewController(){
	this.view = html5canvasView(6, 8, 2, 1);
}

var WebApplication = WebApplication||{};
//the service will be used by the controller.the execution service will connect to the execution engine 
// and send data to each other
function ExecutionService(){
	this.engine = (function (){//connect to the existing engine, the simple case is local code simulator 
	});
}


function html5canvasView(r, c, x, y) {
	var rootDom = $('#robot-playground')[0];
 	var view = makeMyBoardView(rootDom, r, c);
	var classRobotPlaygroundCharacter = 'robot-playground-character';
	var robotElement = '<div class = "' + classRobotPlaygroundCharacter + '" style = "maxHeight: 100%; height:100%; width: 100%; maxWidth: 100%;">'+
									'<img src="/playground/images/robot.png" style = "maxHeight: 100%; height:100%; width: 100%; maxWidth: 100%;">'
									+'</div>';
 	view.createElementAtBoard(x, y, 'robot', robotElement);
 	return view;
}

	//beresponsible for the databinding between the property and the dom element

html5canvasView.prototype.CreateCharacter = function(){};
html5canvasView.prototype.MoveCharacter = function(){};

$(document).ready(function(){
	 var controller = new ViewController();
	 WebApplication.boardController = controller;
	setTimeout(function(){
		console.log(WebApplication.boardController.view.MoveElementInsideBoard(2,1,2,3, 'robot',1000));
	}, 1000); 
})


// the central execution engine, it could be web page based. or could be on the cloud
// but all the different execution engine share the same computation model
function ExecutionEngine(){
}

// the execution driver.the name is cute
function ExecutionDriver(){
	// each command will take 1 second

}