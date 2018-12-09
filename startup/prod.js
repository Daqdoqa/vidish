const helmet = require('helmet');
const compression = require('compression');

module.exports = (app) => {
	app.use(helment());
	app.use(compression());
};