const RedisInterface = require('./RedisInterface');
const RedisCluster = require('./RedisCluster');
const RedisSimple = require('./RedisSimple');

/**
 * @class
 *
 */
class RedisFactory extends RedisInterface {
	constructor (config, isCluster = false) {
		super();
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
}

module.exports = RedisFactory;
