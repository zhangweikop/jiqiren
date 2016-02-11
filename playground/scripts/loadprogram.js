

function loadProgramFromDom (rootDom, porgramLoader) {
	var program = {};

	function buildParameter(command) {
		var parameters = command.parameters;
		if (parameters.length > 0) {
			throw "error when building parameters";
		}
		return '';
	}
	function buildBlock(domNode, classKeyword) {
		var blocks = [];
		var line = '';
		var command;
		var statement;
		if (domNode.className.indexOf(classKeyword) < 0) {
			return;
		} else {
			var commandName = JSON.parse(domNode.dataset.command).name;
		}

		var parameters = {};
		if (commandName.indexOf('for')>-1) {
			parameters.conditionCb = function(stack, N, robot) {
				stack.i < N;
			}
		}
		if (domNode.children.length > 0) {
			parameters.functionBody = function() {
				for (var i = 0; i < domNode.children.length; i++) {
					var child = domNode.children[i];
					buildBlock(child, classKeyword);
				}
			}
		}
		porgramLoader.nextBlock(commandName, parameters);		
	}

	function buildProgram() {
		var root = $(rootDom)[0];
		var classKeyword = root.dataset.classKeyword;
		for (var i = 0; i < root.children.length; i++) {
			buildBlock(root.children[i],  classKeyword);
		}
	}
	
	return {
		porgramLoader: porgramLoader,
		loadProgram: buildProgram,
	};
}