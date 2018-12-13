let redis = require('redis');
const TEST_PREFIX = process.env.modeTest === 'use' ? 'test_' : '';

class RedisChannel {
	constructor({channelName, redisPrefix, clientSubscriber, clientPublisher}) {
		if (!channelName) throw new Error('Empty channel name');

		this.channelName = channelName;
		this.redisPrefix = redisPrefix;
		this.subscriber  = clientSubscriber;
		this.publisher   = clientPublisher;

		this.subscriber.subscribe(this.channel);
	}

	get channel () {
		return TEST_PREFIX + this.redisPrefix + this.channelName;
	}

	/**
	 * Listen event
	 * @param  {function} handler
	 * @returns {RedisChannel}
	 */
	listen(handler) {
		this.subscriber.on('message', handler);

		return this;
	}

	/**
	 * Handler on error
	 * @param {function} handler
	 * @returns {RedisChannel}
	 */
	error(handler) {
		this.subscriber.on('error', handler);

		return this;
	}


	/**
	 * Publish message in channel
	 * @param {string} message
	 */
	async publish(message) {
		return new Promise((ok, bad)=> {
			this.publisher.publish(this.channel, message, function (err, res) {
				if (err) return bad(err);
				ok(res);
			});
		});
	}
}

module.exports = RedisChannel;
