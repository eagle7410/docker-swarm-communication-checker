const byFormat = (intance, format = 'd-m-y', isShiftUtc = false) => {
	if (isShiftUtc)
		intance = DateCustom.toUtc(intance);

	let year    = intance.getFullYear();
	let month   = DateCustom.numberHas2Symbols(intance.getMonth() + 1);
	let day     = DateCustom.numberHas2Symbols(intance.getDate());
	let hours   = DateCustom.numberHas2Symbols(intance.getHours());
	let minutes = DateCustom.numberHas2Symbols(intance.getMinutes());
	let seconds = DateCustom.numberHas2Symbols(intance.getSeconds());

	return format.replace('d', day)
		.replace('m', month)
		.replace('y', year)
		.replace('h', hours)
		.replace('i', minutes)
		.replace('s', seconds);
};

class DateCustom extends Date {
	constructor (...agrs) {
		super(...agrs);
	}

	/**
	 * Return date with shift days.
	 *
	 * @param {number} countDays
	 * @param {number} ts
	 *
	 * @return {DateCustom}
	 */
	shiftDays (countDays, ts) {
		countDays = isNaN(countDays) ? 0 : ~~Number(countDays);
		ts = ts || Date.now();

		let date = new DateCustom(ts);

		date.setDate(date.getDate() + countDays);

		return date;
	}

	toStringByFormat (format) {
		return byFormat(this, format);
	}

	offsetPlus () {
		return new DateCustom(this.getTime() + this.getTimezoneOffset() * DateCustom.millisecondsInMinute());
	}
	offsetMinus () {
		return new DateCustom(this.getTime() - this.getTimezoneOffset() * DateCustom.millisecondsInMinute());
	}

	isFuture (params = {isUtc : false}) {
		const {isUtc} = params;
		const now = Date.now() + (isUtc ? this.getTimezoneOffset() * DateCustom.millisecondsInMinute() : 0);

		return now < this.getTime();
	}

	isFutureOrNowDay () {
		if (this.isFuture()) {
			return true;
		}

		return (new Date()).toStringByFormat('d-m-y') === this.toStringByFormat('d-m-y');
	}
	static dateToStringFormat (data, format, isShiftUtc) {
		return byFormat(data, format, isShiftUtc);
	}

	static numberHas2Symbols (val) {
		return String(val.toString().length < 2 ? '0' + val : val);
	}

	static millisecondsInHour() {
		return 36e5;
	}

	static millisecondsInMinute() {
		return 60e3;
	}

	static utcNow() {
		return new DateCustom(Date.now()).offsetPlus().getTime();
	}

	static toUtc(date) {
		date = date || new Date();

		return (new DateCustom(date.getTime())).offsetPlus();
	}

	static toLocal(date) {
		return (new DateCustom(date.getTime())).offsetMinus();
	}

	static nowPlusDays (shiftDays) {
		const date = new DateCustom();
		date.setDate(date.getDate() + Number(shiftDays));

		return date;
	}

	static nowDateString () {
		return (new DateCustom()).toStringByFormat('y-m-d');
	}
}


module.exports = DateCustom;
