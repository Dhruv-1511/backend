const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.3',
		info: {
			title: 'Sitenot API',
			version: '1.0.0',
			description: 'Accounting backend: Auth, Workspaces, Parties, and Transactions',
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [{ bearerAuth: [] }],
		servers: [
			{ url: 'http://localhost:4000', description: 'Local development' },
			{ url: 'https://backend-9rz5.onrender.com', description: 'Production server' },
		],
	},
	apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
