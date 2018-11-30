class RedisInterface {
	constructor () {
		/**
		 *
		 * @type {object}
		 * @protected
		 */
		this._provider = null;
	}

	set (name, value, liveSecond, call) {
		let args = [name, value];

		if (typeof liveSecond === 'function') {
			call       = liveSecond;
			liveSecond = null
		}

		if (liveSecond) args.push('EX', liveSecond);

		this._provider.set(...args, call);
	}

	get (name, call) {
		this._provider.get(name, call);
	}

	exists (name, call) {
		this._provider.exists(name, call);
	}

	async keySet (name, value, liveSecond) {
		return new Promise((ok,bad) => {
			let args = [name, value];

			if (liveSecond) args.push('EX', liveSecond);

			this.set(...args, (err, result) => {
				if (err) return bad(err);
				ok(result);
			});
		});
	}

	async keyGet (name) {
		return new Promise((ok,bad) => {
			this.get(name, (err, result) => {
				if (err) return bad(err);
				ok(result);
			})
		});
	}

	async keyExists (name) {
		return new Promise((ok,bad) => {
			this.exists(name, (err, result) => {
				if (err) return bad(err);
				ok(result);
			})
		});
	}
}

module.exports = RedisInterface;
