const redis = require('redis');
const RedisInterface = require('./RedisInterface');

class RedisSimple extends RedisInterface {
	constructor (config) {
		super();
		const {port, host} = config;
		this._provider = redis.createClient({port, host});
	}
}

module.exports = RedisSimple;
