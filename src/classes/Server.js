const http    = require('http');
const path    = require('path');
const express = require('express');
const reload  = require('reload');
const morgan  = require('morgan');
const Model   = require('./Model');
const RedisFactory = require('../modules/Redis/RedisFactory');
const db = require('../modules/db');


const REDIS_PORT       = process.env.REDIS_PORT || '6379';
const REDIS_IS_CLUSTER = (process.env.REDIS_IS_CLUSTER || '').toUpperCase() === 'TRUE';
const REDIS_PASSWORD   = process.env.REDIS_PASSWORD || '';
const REDIS_LOGIN      = process.env.REDIS_LOGIN || '';
const REDIS_PREFIX     = process.env.REDIS_PREFIX || '';
const REDIS_HOST       = process.env.REDIS_HOST || 'localhost';


let servers = [];

if (REDIS_IS_CLUSTER) {
	for(let host of  REDIS_HOST.split(' '))
		servers.push({host, port: REDIS_PORT});
}

const REDIS_CONFIG = {
	servers,
	prefix   : REDIS_PREFIX,
	password : REDIS_PASSWORD,
	login    : REDIS_LOGIN,
	host     : REDIS_HOST,
	port     : REDIS_PORT
};

console.log('REDIS_CONFIG is ', REDIS_CONFIG);

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

		this._moduleRedis = new RedisFactory(REDIS_CONFIG, REDIS_IS_CLUSTER);

		this._redisChannelInfo = {};
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

	async handlerDatabaseInfo (req, res) {
		try {
			let structure = {};

			let rows = await Model._query('SHOW TABLES');
			let table;
			let columns;

			for (let row of rows) {
				table   = Object.values(row).pop();
				columns = await  Model._query(`SHOW COLUMNS FROM ${table}`);

				structure[table] = {
					columns  : (columns || []).map(row => row.Field),
					rowCount : await Model.count(null, [], table)
				};
			}

			res.json({
				isOk : true,
				structure
			});

		} catch (e) {

			res.json({
				isOk : false,
				message : typeof e === "string" ? e : e.message
			});

		}
	}

	async handlerRedisChannelInfo (req, res) {

		try {
			const name = req.params.channel;

			if (!name) throw new Error('Empty channel name');

			if (!this._redisChannelInfo[name]) {

				this._redisChannelInfo[name] = {message: []};

				this._moduleRedis.channelOpen(name)
					.listen((channel, message) => {
						this._redisChannelInfo[name].message.push({
							type : 'INFO',
							message
						})
					})
					.error(err => {
						this._redisChannelInfo[name].message.push({
							type    : 'ERR',
							message : err.message ? err.message : err
						})
					})
			}

			res.json({
				isOk : true,
				info : this._redisChannelInfo[name]
			});

		} catch (e) {

			res.json({
				isOk : false,
				message : typeof e === "string" ? e : e.message
			});

		}
	}

	async handlerRedisChannelSend (req, res) {

		try {

			const {name, message} = req.params;

			if (!name) throw new Error('Empty channel name');
			if (!message) throw new Error('Empty channel message');

			if (!this._redisChannelInfo[name]) {
				throw new Error('Channel Not exist');
			}


			await this._moduleRedis.channelPublish(name, message);

			res.json({isOk : true});

		} catch (e) {

			res.json({
				isOk : false,
				message : typeof e === "string" ? e : e.message
			});

		}
	}

	async up () {

		this._app.use(morgan('combined'));

		this._app.set('view engine', 'pug');
		this._app.set('views', path.join(__dirname, '../public'));

		this._app.get('/redis/channel/:name/send/:message', (req, res) => this.handlerRedisChannelSend(req, res));
		this._app.get('/redis/channel/:channel', (req, res) => this.handlerRedisChannelInfo(req, res));
		this._app.get('/redis/:key/:value', (req, res) => this.handlerRedisSet(req, res));
		this._app.get('/redis/:key', (req, res) => this.handlerRedisGet(req, res));

		this._app.get('/db-info', (req, res) => this.handlerDatabaseInfo(req, res));

		this._app.all(
			'/',
			async (req, res) => {
				const MYSQL_VERSION = 'NOT GET';

				res.render('index', {
					MYSQL_VERSION,
					MYSQL_CONFIG: db.getConfig(),
					REDIS_CONFIG,
					REDIS_IS_CLUSTER,
				})
			}
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
