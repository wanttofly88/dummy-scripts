// эвент-эмиттер
// var eventEmitter = new EventEmitter();
// eventEmitter.subscribe([channel], handler);
// eventEmitter.unsubscribe([channel], handler);
// eventEmitter.dispatch([channel], event);

var EventEmitter = function() {
	this._handlers = {
		all: []
	};

	this._frozen = false;

	this.dispatch = function(channel, event) {
		var channel;
		var handlersGroup;

		if (!event) {
			event = channel;
			channel = 'all';
		}

		if (event && event.type.indexOf(':')) {
			channel = event.type.split(':')[0];
		}

		if (!this._handlers.hasOwnProperty(channel)) {
			this._handlers[channel] = [];
		}

		this._frozen = true;

		this._handlers[channel].forEach(function(handler) {
			handler(event);
		});

		if (channel !== 'all') {
			this._handlers['all'].forEach(function(handler) {
				handler(event);
			});
		}

		this._frozen = false;
	}

	this.subscribe = function(channel, handler) {
		var handlersGroup;

		if (!handler) {
			handler = channel;
			channel = 'all';
		}

		if (this._frozen) {
			console.error('trying to subscribe to EventEmitter while dispatch is working');
		}

		if (typeof handler !== 'function') {
			console.error('handler has to be a function');
			return;
		}

		if (!this._handlers.hasOwnProperty(channel)) {
			this._handlers[channel] = [];
		}

		if (this._handlers[channel].indexOf(handler) === -1) {
			this._handlers[channel].push(handler);
		} else {
			console.error('handler already set');
			return;
		}
	}

	this.unsubscribe = function(channel, handler) {
		if (!handler) {
			handler = channel;
			channel = 'all';
		}

		if (this._frozen) {
			console.error('trying to unsubscribe from EventEmitter while dispatch is working');
		}

		if (typeof handler !== 'function') {
			console.error('handler has to be a function');
			return;
		}

		if (!this._handlers[channel]) {
			console.error('channel ' + channel + '  does not exist');
			return;
		}

		if (this._handlers[channel].indexOf(handler) === -1) {
			console.log(handler);
			console.error('trying to unsubscribe unexisting handler');
			return;
		}
		this._handlers[channel] = this._handlers[channel].filter(function(h) {
			return h !== handler;
		});
	}
}

export default EventEmitter;