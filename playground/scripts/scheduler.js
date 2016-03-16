// commandTask definition
// each commandTask has name, and cb which is the function body,and parameters
function commandTask (pid, name, fun, runTimeEnvironment) {
	this.name = name;
	this.fun = fun;
	this.status = '';
	this.id = -1;
	this.pid = pid;
	this.commandCenter = null;
	var that = this;
	this.onFinished = function() {
		that.finish();
		//that.commandCenter.finishCommandTask(that.pid, that);
	};
	this.environment =  runTimeEnvironment;

}
commandTask.prototype.isRunning = function() {
	return (this.status === 'running') || (this.status === 'ready');
}
commandTask.prototype.isActive = function() {
	return (this.status !== 'finished');
};

commandTask.prototype.finish = function (stack) {
	this.status = 'finished';
}

commandTask.prototype.run = function (stack) {
	var that = this;
	var hasDependency = false;
	if (this.status !== 'running') {
		if (!hasDependency) {
			this.status = 'running';
			var loader = new runTimeEnvironment(that.commandCenter, that.environment.pid, that.environment.driver); 
			var status = this.fun(that.onFinished, loader, stack);
			if (status) {
				this.status = 'ready';
			}
		}
	}
}

// commandCenter which has a event Loop
function commandCenter() {
	this.commandQueue = [];
	this.stack = [];
	this.eventLoopInterval = 10;
}

commandCenter.prototype.reset = function () {
	this.commandQueue = [];
	this.stack = [];
}

commandCenter.prototype.queueNewCommandTask = function (pid, commandTask) {
	commandTask.commandCenter = this;
	commandTask.status = 'created';
	if(!this.commandQueue[pid]) {
		this.commandQueue[pid] = [commandTask];
	} else {
		this.commandQueue[pid].push(commandTask);
	}
	if (!this.stack[i]) {
		this.stack[i] = [];
	}	
}

commandCenter.prototype.addNewCommandTask = function (pid, address, commandTask) {
	commandTask.commandCenter = this;
	commandTask.status = 'created';
	if(!this.commandQueue[pid]) {
		this.commandQueue[pid] = [commandTask];
	} else {
		this.commandQueue[pid].splice(address, 0, commandTask);
	}	
	if (!this.stack[pid]) {
		this.stack[pid] = [];
	}
};

commandCenter.prototype.flushCommandTask = function (pid) {
	if (this.commandQueue[pid]) {
		for (var i = 0; i < this.commandQueue[pid].length; i++) { 
			var task = this.commandQueue[pid][i];
			if (!!task) {
				if (!task.isActive()){
					this.commandQueue[pid].shift();
					this.stack[pid].pop();
					return;
				}
			} else {
				this.commandQueue[pid].shift();

			}
		}		
	};

}

commandCenter.prototype.EventLoop = function () {
	for (var i = 0; i < this.commandQueue.length; i++) {
		this.flushCommandTask(i);
		var commandTask = this.commandQueue[i][0];
		var stack = this.stack[i];
		if (!!commandTask){
			if(commandTask.isActive()) {
				if(commandTask.isRunning()) {
				} else {
					var stackVar = {};

					stack.push(stackVar);
				}

				commandTask.run(stack[stack.length-1]);

			}
		}
	}
	var that = this;
	console.log('running')
	window.setTimeout(function() { that.EventLoop(); }, that.eventLoopInterval);
}


// the program loader is the runtime environment/context of the command or function
function runTimeEnvironment(commandCenter, pid, driver, address) {
	this.driver = driver;
	this.commandCenter = commandCenter;
	this.pid = pid;
	this.address = address || 0;
}

runTimeEnvironment.prototype.nextBlock = function (statement, parameters) {
	if (this.driver.functions.hasOwnProperty(statement)) {
		this.next(statement);
	} else if (typeof statement === 'function'){
	
		this.next(statement);


	}
}

//Low level function used by the nextBlock function to call the underlying runtime function
runTimeEnvironment.prototype.next = function (instruction) {
	var foo;
	var task;
	if(typeof instruction === 'string') {
		foo = this.driver.functions[instruction];
		if (foo) {
			task = new commandTask(this.pid, foo.name, foo.function, this);
			this.commandCenter.addNewCommandTask(this.pid, this.address, task);
			this.address++;
			return true;
		}
	} else if (typeof instruction === 'function'){
		// the definition of functionBody is like
		// loader 
		// function foo(onFinished, loader, stack) { 
		//	...
		//  onFinished();															
		// }
		foo = instruction;
		task = new commandTask(this.pid, 'function', foo, this);
		this.commandCenter.addNewCommandTask(this.pid, this.address, task);
		this.address++;
		return true;
	}
	return false;
};

runTimeEnvironment.prototype.nextNdelete = function (conditionCb, loopBody) {
//todo
	if (loopBody) {
		var task = new commandTask(this.pid, 'for', function() {buildProgram});
		this.commandCenter.addNewCommandTask(this.pid, task);
		return true;
	}
	return false;
};
