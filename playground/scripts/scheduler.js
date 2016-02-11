// commandTask definition
// each commandTask has name, and cb which is the function body,and parameters
function commandTask (pid, name, cb, parameters) {
	this.name = name;
	this.cb = cb;
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
			this.cb(that.onFinished);
		}
	}
}

// commandCenter which has a event Loop
function commandCenter() {
	this.activePool = [];
	this.waitPool = [];
	this.programCounter = [];
	this.eventLoopInterval = 10;
}

commandCenter.prototype.addNewCommandTask = function (pid, commandTask) {
	commandTask.commandCenter = this;
	commandTask.status = 'wait';
	if(!this.waitPool[pid]) {
		this.waitPool[pid] = [commandTask];
		this.activePool[pid] = null;
		this.programCounter[pid] = 0;
	} else {
		this.waitPool[pid].push(commandTask);
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
			var pc = this.programCounter[i];
			var candidateTask = this.waitPool[i][pc];
			if (candidateTask) {
				this.programCounter[i]++;
				this.activePool[i] = candidateTask;
			}	
		}
	}
	var that = this;
	console.log('running')
	window.setTimeout(function() { that.EventLoop(); }, that.eventLoopInterval);
}


function programLoader(commandCenter, pid, driver) {
	this.driver = driver;
	this.commandCenter = commandCenter;
	this.pid = pid;

}

programLoader.prototype.nextBlock = function (statement, parameters) {
	if (this.driver.functions.hasOwnProperty(statement)) {
		this.next(statement);
	} else if (this.driver.flowControl.hasOwnProperty(statement)){
		if (statement.indexOf('for')>-1) {
			this.nextN(parameters.conditionCb, parameters.loopBody);
		}
	}
}
programLoader.prototype.next = function (instructionName) {
	var instruction = this.driver.functions[instructionName];
	var task;
	if (instruction) {
		task = new commandTask(this.pid, instruction.name, instruction.function);
		this.commandCenter.addNewCommandTask(this.pid, task);
		return true;
	}
	return false;
};
programLoader.prototype.nextN = function (conditionCb, loopBody) {
//todo
};