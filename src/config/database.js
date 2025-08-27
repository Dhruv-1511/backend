const mongoose = require('mongoose');
const { env } = require('./env');

function buildMongoUri() {
	let base = env.mongoUri.trim();
	// If URI already contains a path component (like /dbname or /?options), don't append db name
	const hasPath = base.includes('/?') || /\/[^?]+/.test(base.replace('mongodb+srv://', '').replace('mongodb://', ''));
	if (!hasPath) {
		if (!base.endsWith('/')) base += '/';
		base += env.mongoDbName;
	}
	return base;
}

async function connectToDatabase() {
	const uri = buildMongoUri();
	mongoose.set('strictQuery', true);

	const maxAttempts = 5;
	let attempt = 0;
	while (attempt < maxAttempts) {
		try {
			return await mongoose.connect(uri, {
				serverSelectionTimeoutMS: 20000,
				connectTimeoutMS: 20000,
				// family: 4, // uncomment if IPv6 DNS issues occur
			});
		} catch (err) {
			attempt += 1;
			// eslint-disable-next-line no-console
			console.error(`Mongo connection failed (attempt ${attempt}/${maxAttempts})`, err?.message || err);
			if (attempt >= maxAttempts) throw err;
			await new Promise((r) => setTimeout(r, 3000));
		}
	}
}

module.exports = { connectToDatabase };
