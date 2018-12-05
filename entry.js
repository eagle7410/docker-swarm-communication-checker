
const db = require('./src/modules/db');
const Server = require('./src/classes/Server');

(new Server(6080)).up();
