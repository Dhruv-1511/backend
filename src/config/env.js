const dotenv = require('dotenv');

dotenv.config();

const env = {
	port: process.env.PORT ? Number(process.env.PORT) : 4000,
	// Default to local Mongo without auth to run without Docker
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
	mongoDbName: process.env.MONGO_DB_NAME || 'sitenot',
	jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = { env };
