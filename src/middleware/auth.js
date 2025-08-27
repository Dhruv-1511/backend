const createHttpError = require('http-errors');
const { verifyToken } = require('../utils/jwt');

function requireAuth(req, _res, next) {
	const header = req.headers.authorization;
	if (!header || !header.startsWith('Bearer ')) {
		return next(new createHttpError.Unauthorized('Missing or invalid Authorization header'));
	}
	const token = header.substring('Bearer '.length);
	try {
		const payload = verifyToken(token);
		req.user = payload;
		return next();
	} catch (_e) {
		return next(new createHttpError.Unauthorized('Invalid token'));
	}
}

module.exports = { requireAuth };
