

function loadProgramFromDom (rootDom, porgramLoader) {
	var program = {};

	function buildParameter(command) {
		var parameters = command.parameters;
		if (parameters.length > 0) {
			throw "error when building parameters";
		}
		return '';
	}

	function buildBlock(currentPorgramLoader, domNode, firstClassKeyword, blockClassKeyword) {
		var blocks = [];
		var line = '';
		var command;
		var statement;
		var commandName;
		if (domNode.className.indexOf(firstClassKeyword) < 0) {
			return;
		} else {
			commandName = JSON.parse(domNode.dataset.commandName);
		}

		var bodyBlock = $(domNode).children(blockClassKeyword)[0];
		if (bodyBlock) {
			var lines = [];
			for (var i = 0; i < bodyBlock.children.length; i++) {
				var child = bodyBlock.children[i];
				lines.push(buildBlock(currentPorgramLoader, child, firstClassKeyword, blockClassKeyword));
			}
			var bodyFunction = function () {
				for (var i = 0; i < lines.length; i++) {
					lines[i]();
				}
			};
			return bodyFunction;
		} else {
			return function() {currentPorgramLoader.nextBlock(commandName, parameters);};
		}
	}

	function buildStatement(currentPorgramLoader, domNode, firstClassKeyword, blockClassKeyword) {
		var blocks = [];
		var line = '';
		var command;
		var statement;
		var commandName;
		if (domNode.className.indexOf(firstClassKeyword) < 0) {
			return;
		} else {
			commandName = JSON.parse(domNode.dataset.commandName);
		}

		var parameters = {};
		if (commandName.indexOf('for')>-1) {
			var N = 4;
			parameters.preBody = function(onFinished, stack) {
				if(stack.i && stack.i >= N) {
					onFinished();
				};
			}
			parameters.postBody = function(onFinished, stack) {
				if(stack.i) {
					stack.i=1;
				}else {
					stack.i++;
				}
			}
		}
		var bodyNode = $(domNode).children(blockClassKeyword)[0];
		if (bodyNode) {
			var subLoader = new programLoader(currentPorgramLoader.commandCenter, currentPorgramLoader.pid, currentPorgramLoader.driver);

			parameters.functionBody = buildBlock(subLoader, bodyNode, firstClassKeyword, blockClassKeyword);
		}
		currentPorgramLoader.nextBlock(commandName, parameters);		
	}

	function buildProgram() {
		var root = $(rootDom)[0];
		var firstClassKeyword = root.dataset.firstClassKeyword;
		var blockClassKeyword = root.dataset.blockClassKeyword;
		for (var i = 0; i < root.children.length; i++) {
			buildStatement(currentPorgramLoader, root.children[i],  firstClassKeyword, blockClassKeyword);
		}
	}
	
	return {
		porgramLoader: porgramLoader,
		loadProgram: buildProgram,
	};
}