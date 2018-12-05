class ErrorValidate extends Error {
	constructor (message, code, messData = null, ...agrs) {
		super(message, ...agrs);
		this.name = 'ErrorValidate';
		this.code = code || 0;
		this.messData = messData;
	}

	static extend(e) {
		e.name     = 'ErrorValidate';
		e.code     = this.codes().unknown;
		e.messData = null;

		return e;
	}

	static codes() {
		return {
			modelBadParentId : 6,
			modelBadApiKey   : 5,
			keyEndLive       : 4,
			keyInactive      : 3,
			keyNotFound      : 2,
			keyBad           : 1,
			unknown          : 0
		};
	}
}

module.exports = ErrorValidate;
