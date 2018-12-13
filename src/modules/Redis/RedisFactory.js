const RedisInterface = require('./RedisInterface');
const RedisCluster = require('./RedisCluster');
const RedisSimple = require('./RedisSimple');

/**
 * @class
 *
 */
class RedisFactory extends RedisInterface {
	constructor (config, isCluster = false) {
		super(config);
		/**
		 *
		 * @type {boolean}
		 * @protected
		 */
		this._isCluster = isCluster;
		/**
		 *
		 * @type {RedisInterface}
		 * @protected
		 */
		this._provider  = isCluster
			? new RedisCluster(config)
			: new RedisSimple(config);
	}

	channelOpen(channel) {
		return this._provider.channelOpen(channel);
	}


	/**
	 * Check open channel
	 *
	 * @param {string} channel
	 *
	 * @return {boolean}
	 */
	isChannelOpen(channel) {
		return this._provider.isChannelOpen(channel);
	}

	/**
	 * Set event handler to channel
	 *
	 * @param {string}   channel
	 * @param {function} handler
	 */
	channelListen(channel, handler) {
		return this._provider.channelListen(channel, handler);
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
		return this._provider.channelError(channel, handler);
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
		return this._provider.channelPublish(channel, message);
	}

}

module.exports = RedisFactory;
