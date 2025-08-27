const http = require('http');
const app = require('./app');
const { connectToDatabase } = require('./config/database');
const { env } = require('./config/env');

async function start() {
	try {
		await connectToDatabase();
		const server = http.createServer(app);
		server.listen(env.port, () => {
			console.warn(`API listening on http://localhost:${env.port}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

start();
