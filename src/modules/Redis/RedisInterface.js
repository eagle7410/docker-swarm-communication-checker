const RedisChannel = require('./RedisChannel');

class RedisInterface {
	constructor ({prefix}) {
		/**
		 *
		 * @type {object}
		 * @protected
		 */
		this._provider = null;
		this.channels  = {};
		this.prefix    = prefix

	}

	namePlusPrefix (name) {
		return this.prefix + name;
	}

	set (name, value, liveSecond, call) {
		let args = [this.namePlusPrefix(name), value];

		if (typeof liveSecond === 'function') {
			call       = liveSecond;
			liveSecond = null
		}

		if (liveSecond) args.push('EX', liveSecond);

		this._provider.set(...args, call);
	}

	get (name, call) {
		this._provider.get(this.namePlusPrefix(name), call);
	}

	exists (name, call) {
		this._provider.exists(this.namePlusPrefix(name), call);
	}

	async keySet (name, value, liveSecond) {
		return new Promise((ok,bad) => {
			let args = [this.namePlusPrefix(name), value];

			if (liveSecond) args.push('EX', liveSecond);

			this.set(...args, (err, result) => {
				if (err) return bad(err);
				ok(result);
			});
		});
	}

	async keyGet (name) {
		return new Promise((ok,bad) => {
			this.get(this.namePlusPrefix(name), (err, result) => {
				if (err) return bad(err);
				ok(result);
			})
		});
	}

	async keyExists (name) {
		return new Promise((ok,bad) => {
			this.exists(this.namePlusPrefix(name), (err, result) => {
				if (err) return bad(err);
				ok(result);
			})
		});
	}

	get newClient () {
		throw new Error('This method not implement');
	}
	/**
	 *
	 * @param {string} channel
	 *
	 * @returns {RedisChannel}
	 */
	channelOpen(channel) {
		if (!this.channels[channel])
			this.channels[channel] = new RedisChannel({
				channelName      : channel,
				redisPrefix      : this.prefix,
				clientSubscriber : this.newClient,
				clientPublisher  : this.newClient
			});

		return this.channels[channel];
	}


	/**
	 * Check open channel
	 *
	 * @param {string} channel
	 *
	 * @return {boolean}
	 */
	isChannelOpen(channel) {
		return Boolean(this.channels[channel]);
	}

	/**
	 * Set event handler to channel
	 *
	 * @param {string}   channel
	 * @param {function} handler
	 */
	channelListen(channel, handler) {
		this._channel(channel).listen(handler);
	}

	/**
	 * Handler in channel on error
	 *
	 * @param {string}   channel
	 * @param {function} handler
	 *
	 * @returns {RedisInterface}
	 */
	channelError(channel, handler) {
		this._channel(channel).error(handler);

		return this;
	}

	/**
	 * Publish message in channel.
	 *
	 * @param {string} channel
	 * @param {string} message
	 *
	 * @returns {RedisInterface}
	 */
	channelPublish(channel, message) {
		this._channel(channel).publish(message);

		return this;
	}

	/**
	 * Get specified channel
	 *
	 * @param {string} channel
	 *
	 * @returns {RedisChannel}
	 *
	 * @private
	 */
	_channel(channel) {
		if (!this.channels[channel])
			throw new Error(`Channel ${channel} don't open`);

		return this.channels[channel]
	}
}

module.exports = RedisInterface;
