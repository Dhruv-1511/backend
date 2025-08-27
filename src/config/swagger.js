const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.3',
		info: {
			title: 'Sitenot API',
			version: '1.0.0',
			description: 'Authentication API for Sitenot backend',
		},
		servers: [{ url: 'http://localhost:4000' }],
	},
	apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
