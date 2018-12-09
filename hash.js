const bcrypt = require('bcrypt');

async function run() {
	const salt = await bcrypt.genSalt(20);
	const hashed = await bcrypt.hash('1234', salt);
	console.log('salt: ', salt);
	console.log('hashed: ', hashed);
}

run();