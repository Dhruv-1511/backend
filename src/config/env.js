const dotenv = require('dotenv');

dotenv.config();

const env = {
	port: process.env.PORT ? Number(process.env.PORT) : 4000,
	// Default to local Mongo without auth to run without Docker (dev only)
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
	mongoDbName: process.env.MONGO_DB_NAME || 'sitenot',
	jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	nodeEnv: process.env.NODE_ENV || 'development',
};

// In production, require a proper Mongo URI
if (
	env.nodeEnv === 'production' &&
	!(env.mongoUri.startsWith('mongodb://') || env.mongoUri.startsWith('mongodb+srv://'))
) {
	// eslint-disable-next-line no-console
	console.error(
		"Invalid MONGO_URI. It must start with 'mongodb://' or 'mongodb+srv://'. Set a valid value in your platform env vars.",
	);
	process.exit(1);
}

module.exports = { env };
