const
	mysql    = require('mysql2'),
	logger   = require('./logger.js')('MySQLConnect'),
	port     = process.env.MYSQL_PORT,
	host     = process.env.MYSQL_HOST,
	user     = process.env.MYSQL_USERNAME,
	password = process.env.MYSQL_PASSWORD,
	database = process.env.MYSQL_DATABASE,
	config   = {
		port,
		host,
		user,
		password,
		database,
		bigNumberStrings: true,
		connectionLimit: 10
	},
	pool     = mysql.createPool(config);

pool.on('error', err => logger.error(err));

pool.getConfig  = () => config;

module.exports = pool;
