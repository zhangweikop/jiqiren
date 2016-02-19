

function loadProgramFromDom (rootDom, runTimeEnvironment) {
	var program = {};

	function buildParameter(domNode, parameterClassKeyword) {
		var parameters = []; 
		$(domNode).children('.' + parameterClassKeyword).each(function(index) {
			var value = $(this).val() || this.placeholder;
			parameters.push(parseFloat(value));
		});
		return parameters;
	}

	function buildStatement(domNode, itemClassKeyword, blockClassKeyword, parameterClassKeyword) {
		var command;
		if (domNode.className.indexOf(itemClassKeyword) < 0) {
			return;
		} else {
			command = JSON.parse(domNode.dataset.commandName);
		}

		var bodyNode = $(domNode).children('.' + blockClassKeyword)[0];

		var lines = [];
		var parameters = buildParameter(domNode, parameterClassKeyword);
		var bodyFunction;

		if (bodyNode) {
			for (var i = 0; i < bodyNode.children.length; i++) {
				var child = bodyNode.children[i];
				lines.push(buildStatement(child, itemClassKeyword, blockClassKeyword, parameterClassKeyword));
			}
			bodyFunction = function (onFinished, environment) {
				for (var i = 0; i < lines.length; i++) {
					lines[i](environment);
				}
			};
		}

		if (command.indexOf('loop')>-1 && !!bodyFunction) {
			var start = parseFloat(parameters[0]) || 0;
			var N = parseFloat(parameters[1]) || 0;;
			var scopeBody = bodyFunction;
			var next = function (onFinished, runTimeEnvironment, stack) {
				
				runTimeEnvironment.next(function(end) {
					
					if(stack.i === undefined || stack.i === null){
						stack.i = start;
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
		var itemClassKeyword = root.dataset.itemClassKeyword;
		var blockClassKeyword = root.dataset.blockClassKeyword;
		var parameterClassKeyword = root.dataset.parameterClassKeyword;

		for (var i = 0; i < root.children.length; i++) {
			buildStatement(root.children[i],  itemClassKeyword, blockClassKeyword, parameterClassKeyword)(runTimeEnvironment);
		}
	}
	
	return {
		currentEnvironment: runTimeEnvironment,
		loadProgram: buildProgram,
	};
}