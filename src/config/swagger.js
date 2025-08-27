const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.3',
		info: {
			title: 'Sitenot API',
			version: '1.0.0',
			description: 'Authentication API for Sitenot backend',
		},
		servers: [
			{ url: 'https://backend-9rz5.onrender.com', description: 'Production server' },
			{ url: 'http://localhost:4000', description: 'Local development' },
		],
	},
	apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
