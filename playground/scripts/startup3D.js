//viewcontroller and view are view realted
function robotMonitorView(root, r, c, x, y) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.c = c;
	var rootDom = $(root)[0];
 	var view = makeMyWorldView(rootDom, r, c);
 	//view.createElementAtBoard(x, y, 'car', 'f50');
 	this.character = view.defaultCharacter;
 	this.view = view;
}

//beresponsible for the databinding between the property and the dom element

robotMonitorView.prototype.CreateCharacter = function(){};
robotMonitorView.prototype.TurnRight = function(cb){
	this.view.makeTurn(true, this.character, cb);
};

robotMonitorView.prototype.TurnLeft = function(cb){
	this.view.makeTurn(false, this.character, cb);
};

robotMonitorView.prototype.MoveForward = function(cb){
	this.view.MoveElementForward(this.character, cb);
};

robotMonitorView.prototype.MoveBackward = function(cb){
	this.view.MoveElementBackward(this.character, cb);

};
function RobotMonitorViewController(){
	this.viewController = new robotMonitorView('#robot-playground', 20, 20, 2, 3);
	//this.execution = new ExecutionService(this.viewController);
}

function programWindowView(root, programMenu, programEditor, supportedCommands) {
	this.rootDom = $(root)[0];
	this.view = makeProgramWindowView(this.rootDom , programMenu, programEditor, supportedCommands);
}

function ProgramWindowViewController(executionService){
	this.programMenu = 'lowlevel-command-gallery';
	this.programEditor = 'lowlevel-command-editor';
	this.rootProgamWindowContainerID = '#program-editor';
	this.view = new programWindowView(this.rootProgamWindowContainerID, this.programMenu, this.programEditor, executionService.supportedCommands);
}

window.WebApplication = window.WebApplication||{};
//load the command from files

//the service will be used by the controller.the execution service will connect to the execution engine 
// and send data to each other
function loadService(programWindowViewController, ExecutionService) {
	this.rootDom = $(programWindowViewController.rootProgamWindowContainerID)[0]; 
	this.runTimeEnvironment  = new runTimeEnvironment(ExecutionService.commandCenter , 0, ExecutionService.driver);

	this.load = loadProgramFromDom(this.rootDom, this.runTimeEnvironment).loadProgram;

}
function ExecutionService(runtime){
	//connect to the existing engine, the simple case is local code simulator 
	
	var driver = {functions : {}, flowControl: {}};
	driver.functions.MoveForward = { name: 'MoveForward', function: function (cb) {runtime.MoveForward(cb);}};
	driver.functions.MoveBackward = { name: 'MoveBackward', function: function (cb) {runtime.MoveBackward(cb);}};
	driver.functions.TurnLeft = { name: 'TurnLeft', function: function (cb) {runtime.TurnLeft(cb);}};
	driver.functions.TurnRight = { name: 'TurnRight', function: function (cb) {runtime.TurnRight(cb);}};
	driver.flowControl.for = {name: 'loop', parameters: [{input: 'numeric', default: 0}, {text: 'to'}, {input: 'numeric', default: 1}], block: '{}'};
	var supportedCommands= [];

	for (var key in driver.functions) {
		if (driver.functions.hasOwnProperty(key)) {
			var value = driver.functions[key];
			supportedCommands.push(value);
		}
	}
	for (var key in driver.flowControl) {
		if (driver.flowControl.hasOwnProperty(key)) {
			var value = driver.flowControl[key];
			supportedCommands.push(value);
		}
	}

	this.commandCenter = new commandCenter();
	this.driver = driver;
	
	this.supportedCommands = supportedCommands;
}


$(document).ready(function(){
	 var robotMonitorViewController = new RobotMonitorViewController();
	 var localExecutionService = new ExecutionService(robotMonitorViewController.viewController);
	 var programController = new ProgramWindowViewController(localExecutionService);
	 var environment = new loadService(programController, localExecutionService);

	 WebApplication.boardController = robotMonitorViewController;
	 WebApplication.programController = programController;
	 $('#run-button').click(function() {
	 	environment.load();
	 	localExecutionService.commandCenter.EventLoop();
	 });
	setTimeout(function(){
		//console.log(WebApplication.boardController.viewController.view.MoveElementInsideBoard(2, 3, 'robot',1000));
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