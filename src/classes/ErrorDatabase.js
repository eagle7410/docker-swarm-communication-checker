class ErrorDatabase extends Error {

	constructor (...agrs) {
		super(...agrs);
		this.name = 'ErrorDatabase';
	}

	static extend(e) {
		e.name = 'ErrorDatabase';

		return e;
	}
}

module.exports = ErrorDatabase;
