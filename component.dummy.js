import dispatcher from '../dispatcher.js';

class ElementClass extends HTMLElement {
	constructor(self) {
		self = super(self);
		self.init.call(self);
	}

	init() {
	}
	connectedCallback() {
	}
	disconnectedCallback() {
	}
}

customElements.define('component-name', ElementClass);

export default ElementClass;