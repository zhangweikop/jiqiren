// commandTask definition
// each commandTask has name, and cb which is the function body,and parameters
function commandTask (pid, name, block, parameters) {
	this.name = name;
	this.block = block;
	this.parameters = parameters;
	this.status = '';
	this.id = -1;
	this.pid = pid;
	this.commandCenter = null;
	var that = this;
	this.onFinished = function() {
		that.status = 'finished';
		that.commandCenter.finishCommandTask(that.pid);
	};
}

commandTask.prototype.execute = function () {
	var that = this;
	var hasDependency = false;
	if (this.status !== 'running') {
		if (!hasDependency) {
			this.status = 'running';
			this.block(that.onFinished);
		}
	}
}

function stackTask(pid, name, cb, parameters) {
	this.body = {};

}


// commandCenter which has a event Loop
function commandCenter() {
	this.activePool = [];
	this.waitPool = [];
	this.eventLoopInterval = 10;
}

commandCenter.prototype.reset = function () {
	this.activePool = [];
	this.waitPool = [];	

}

commandCenter.prototype.addNewCommandTask = function (pid, address, commandTask) {
	commandTask.commandCenter = this;
	commandTask.status = 'wait';
	if(!this.waitPool[pid]) {
		this.waitPool[pid] = [commandTask];
		this.activePool[pid] = null;
	} else {
		this.waitPool[pid].splice(address, 0, commandTask);
	}	
};

commandCenter.prototype.finishCommandTask = function (pid) {
	this.activePool[pid] = null;
}

commandCenter.prototype.EventLoop = function () {
	for (var i = 0; i < this.activePool.length; i++) {
		var commandTask = this.activePool[i];
		if (commandTask) {
			commandTask.execute();
		} else {
			var candidateTask = this.waitPool[i].shift();
			if (candidateTask) {
				this.activePool[i] = candidateTask;
			}	
		}
	}
	var that = this;
	console.log('running')
	window.setTimeout(function() { that.EventLoop(); }, that.eventLoopInterval);
}


function programLoader(commandCenter, pid, driver, address) {
	this.driver = driver;
	this.commandCenter = commandCenter;
	this.pid = pid;
	this.address = address || 0;
}

programLoader.prototype.nextBlock = function (statement, parameters) {
	if (this.driver.functions.hasOwnProperty(statement)) {
		this.next(statement);
	} else if (this.driver.flowControl.hasOwnProperty(statement)){
		if (statement.indexOf('for')>-1) {
			var loopBody = function () {
				statement();
			};
			this.next(loopBody);


			if (parameters.preBody) {

			}
			if (parameters.functionBody) {
				var subLoader = new programLoader(this.commandCenter, this.pid, this.driver);
				
			}
			if (parameters.postBody) {
				
			}


		}
	}
}
programLoader.prototype.next = function (instructionName) {
	var functionBody;
	var task;
	if(typeof instructionName === 'string') {
		functionBody = this.driver.functions[instructionName];
		if (functionBody) {
			task = new commandTask(this.pid, instruction.name, instruction.function);
			this.commandCenter.addNewCommandTask(this.pid, this.address, task);
			thhis.address++;
			return true;
		}
	} else if (typeof instructionName === 'function'){
		// the definition of functionBody is like 
		// function foo(onFinished) { 
		//	...
		//  onFinished();															
		// }
		functionBody = instructionName;
		task = new commandTask(this.pid, 'function', functionBody);
		this.commandCenter.addNewCommandTask(this.pid, this.address, task);
		this.address++;
		return true;
	}
	return false;
};
programLoader.prototype.nextN = function (conditionCb, loopBody) {
//todo
	if (loopBody) {
		var task = new commandTask(this.pid, 'for', function() {buildProgram});
		this.commandCenter.addNewCommandTask(this.pid, task);
		return true;
	}
	return false;
};