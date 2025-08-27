const { isCelebrateError } = require('celebrate');
const createHttpError = require('http-errors');

function notFound(_req, _res, next) {
	next(new createHttpError.NotFound('Route not found'));
}

function errorHandler(err, _req, res, _next) {
	if (isCelebrateError(err)) {
		const details = {};
		for (const [segment, detail] of err.details.entries()) {
			details[String(segment)] = detail.message;
		}
		return res.status(400).json({ error: 'ValidationError', details });
	}
	const status = err.status || err.statusCode || 500;
	const message = err.message || 'Internal Server Error';
	return res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
