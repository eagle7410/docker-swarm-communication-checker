const redis = require('redis');
const RedisInterface = require('./RedisInterface');

class RedisSimple extends RedisInterface {
	constructor (config) {
		super(config);
		const {port, host} = config;
		this.port = port;
		this.host = host;
		this._provider = this.newClient;
	}

	get configClient () {
		return {
			port : this.port,
			host : this.host,
		};
	}

	get newClient () {
		return redis.createClient(this.configClient);
	}
}

module.exports = RedisSimple;
