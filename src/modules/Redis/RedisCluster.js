const RedisClustr      = require('redis-clustr');
const RedisInterface = require('./RedisInterface');

class RedisCluster extends  RedisInterface {
	constructor (config) {
		super();
		const {servers} = config;
		this._provider = new RedisClustr({
			servers,
			slotInterval: 1000, // default: none. Interval to repeatedly re-fetch cluster slot configuration
			maxQueueLength: 100, // default: no limit. Maximum length of the getSlots queue (basically number of commands that can be queued whilst connecting to the cluster)
			queueShift: false, // default: true. Whether to shift the getSlots callback queue when it's at max length (error oldest callback), or to error on the new callback
			wait: 5000, // default: no timeout. Max time to wait to connect to cluster before sending an error to all getSlots callbacks
		});
	}
}

module.exports = RedisCluster;
