//viewcontroller and view are view realted
function ViewController(){
	this.view = new html5canvasView();
	this.view.CreateCharacter('robot', 4, 6);;
	this.view.MoveCharacter();
	this.view.moveRobot = function(x, y ){};

}

//the service will be used by the controller.the execution service will connect to the execution engine 
// and send data to each other
function ExecutionService(){
	this.engine = (function (){//connect to the existing engine, the simple case is local code simulator 
	});
}


function html5canvasView()

	//beresponsible for the databinding between the property and the dom element

}
html5canvasView.prototype.CreateCharacter = function(){};
html5canvasView.prototype.MoveCharacter = function(){};

$(document).ready(function(){
	PlayGroundCanvasView(8, 6);
})


// the central execution engine, it could be web page based. or could be on the cloud
// but all the different execution engine share the same computation model
function ExecutionEngine(){
}

// the execution driver.the name is cute
function ExecutionDriver(){

}