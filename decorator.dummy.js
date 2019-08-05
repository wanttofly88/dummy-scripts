import dispatcher from '../dispatcher.js';

let name = null;

class Decorator {
	constructor(parent, options) {
		this._parent = parent;
		this._options = Object.assign({
			// defaults
		}, options);
	}

	init() {}

	destroy() {}
}

let attach = function(parent, options) {
	let decorator;

	if (!name) {
		console.error('decorator name is missing');
		return;
	}

	if (!parent._decorators) {
		parent._decorators = {};
	}
	if (!parent._decorators[name]) {
		parent._decorators[name] = new Decorator(parent, options);
		parent._decorators[name].init();
	}
	decorator = parent._decorators[name];

	return decorator;
}

let detach = function(parent) {
	let decorator = parent._decorators[name];
	decorator.destroy();
}

export default {
	attach: attach,
	detach: detach
}