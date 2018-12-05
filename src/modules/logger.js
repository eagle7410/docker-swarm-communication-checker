'use strict';

/**
 * Logger module.
 * 
 * Usage:
 *  const logger = require('./modules/logger.js')(NAME);
 * 
 */

const
    APP_NAME = 'EXT',
    LOG_FOLDER = 'logs',
    Winston = require('winston'),
    fs = require('fs');


if (!fs.existsSync(LOG_FOLDER))
    fs.mkdirSync(LOG_FOLDER);

module.exports = (name = APP_NAME) => {
    const appPath = `${LOG_FOLDER}/${name}`;

    if (!fs.existsSync(appPath))
        fs.mkdirSync(appPath);

    return new(Winston.Logger)({
        transports: [
            new(Winston.transports.Console)({
                colorize: true,
                timestamp: true,
                level: 'debug',
                label: name
            }),
            new(Winston.transports.File)({
                level: 'info',
                name: 'info-logs',
                createDirectory: true,
                timestamp: true,
                filename: `./${appPath}/info.log`,
                json: false
            }),
            new(Winston.transports.File)({
                level: 'error',
                name: 'error-logs',
                createDirectory: true,
                timestamp: true,
                filename: `./${appPath}/errors.log`,
                json: false
            })
        ]
    });

};
