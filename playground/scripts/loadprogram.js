

function loadProgramFromDom (rootDom, runTimeEnvironment) {
	var program = {};

	function buildParameter(command) {
	
	}

	function buildStatement(domNode, firstClassKeyword, blockClassKeyword) {
		var command;
		if (domNode.className.indexOf(firstClassKeyword) < 0) {
			return;
		} else {
			command = JSON.parse(domNode.dataset.commandName);
		}

		var parameters = {};
		var bodyNode = $(domNode).children('.'+blockClassKeyword)[0];

		var lines = [];
		var bodyFunction;
		if (bodyNode) {
			for (var i = 0; i < bodyNode.children.length; i++) {
				var child = bodyNode.children[i];
				lines.push(buildStatement(child, firstClassKeyword, blockClassKeyword));
			}
			bodyFunction = function (onFinished, environment) {
				for (var i = 0; i < lines.length; i++) {
					lines[i](environment);
				}
			};
		}

		if (command.indexOf('loop')>-1 && !!bodyFunction) {
			var N = 3;
			var scopeBody = bodyFunction;
			var next = function (onFinished, runTimeEnvironment, stack) {
				
				runTimeEnvironment.next(function(end) {
					
					if(stack.i === undefined || stack.i === null){
						stack.i = 0;
					}
					if (stack.i < N) {
						 scopeBody(null, runTimeEnvironment);
					}
					end();
				});
				
				runTimeEnvironment.next(function(end) {
					if (stack.i === undefined || stack.i === null) {
						stack.i = 0;
					}
					stack.i++;
					end();
					if (stack.i >= N) {
						onFinished();
					}
				});
				return 'continue';
			}
			command = next;
		}
		
		return function(environment){environment.nextBlock(command, parameters);};		
	}

	function buildProgram() {
		var root = $(rootDom)[0];
		var firstClassKeyword = root.dataset.firstClassKeyword;
		var blockClassKeyword = root.dataset.blockClassKeyword;
		for (var i = 0; i < root.children.length; i++) {
			buildStatement(root.children[i],  firstClassKeyword, blockClassKeyword)(runTimeEnvironment);
		}
	}
	
	return {
		currentEnvironment: runTimeEnvironment,
		loadProgram: buildProgram,
	};
}