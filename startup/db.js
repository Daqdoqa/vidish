const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

module.exports = function () {
	mongoose.connect(config.db)
	.then(() => winston.info(`Connected to ${config.db}`));
};