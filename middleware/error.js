const winston = require('winston');

module.exports = function (err, req, res, next) {
	// log  the exception
	winston.error(err.message, err);
	console.log(err.messge);
	res.status(500).send(err);
};