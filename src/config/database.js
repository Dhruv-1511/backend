const mongoose = require('mongoose');
const { env } = require('./env');

async function connectToDatabase() {
	const uri = `${env.mongoUri}/${env.mongoDbName}`;
	mongoose.set('strictQuery', true);
	return mongoose.connect(uri, {
		serverSelectionTimeoutMS: 5000,
	});
}

module.exports = { connectToDatabase };
