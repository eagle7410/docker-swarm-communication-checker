const http    = require('http');
const path    = require('path');
const express = require('express');
const reload  = require('reload');
const RedisFactory = require('../modules/Redis/RedisFactory');

const port = '6379';
let servers = [];

for(let host of  process.env.SERVER_HOST.split(' '))
	servers.push({host, port});



class Server {
	/**
	 *
	 * @param {number} port
	 * @param {number} version
	 */
	constructor (port, version) {

		process.env.TZ = 'Europe/London';

		this.port         = port;
		this._express     = express;
		this._app         = express();
		this._version     = String(version || 1);
		this._server      = http.Server(this._app);
		this._serverName  = `ServerFrameV${this._version}`;
		this._moduleRedis = new RedisFactory({servers} , true);
	}

	async handlerRedisSet (req, res) {
		const {key, value} = req.params;

		try {
			await this._moduleRedis.keySet(key, value);

			res.json({
				isOk : true,
				message :`Set key ${key} with value ${value}`
			});

		} catch (e) {

			res.json({
				isOk : false,
				message : typeof e === "string" ? e : e.message
			});

		}
	}


	async handlerRedisGet (req, res) {
		const {key} = req.params;

		try {
			const value = await this._moduleRedis.keyGet(key);

			res.json({
				isOk : true,
				value
			});

		} catch (e) {

			res.json({
				isOk : false,
				message : typeof e === "string" ? e : e.message
			});

		}
	}

	async up () {
		this._app.set('view engine', 'pug');
		this._app.set('views', path.join(__dirname, '../public'));

		this._app.get('/redis/:key/:value', (req, res) => this.handlerRedisSet(req, res));
		this._app.get('/redis/:key', (req, res) => this.handlerRedisGet(req, res));

		this._app.all(
			'/',
			(req, res) => res.render('index', {SERVER_HOST : JSON.stringify({servers}, null, '\t')})
		);

		// HOT RELOAD
		reload(this._app);

		this._server.listen(this.port, async () => {
			const baseLine = `=== ${this._serverName} APP READY IN PORT ${this.port} ===\n`;
			const len = baseLine.length - 1;

			console.log(
				`\n\n ${'='.repeat(len)}\n ${baseLine} ${'='.repeat(len)}\n`,
				`link in browser http://localhost:${this.port}\n\n`,
			);

		});
	}

	down () {
		return new Promise( closed => {
			this._server.close(() => closed());
		});
	}
}

module.exports = Server;
