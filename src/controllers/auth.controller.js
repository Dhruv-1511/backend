const { Segments, celebrate, Joi } = require('celebrate');
const AuthService = require('../services/auth.service');

const validateRegister = celebrate({
	[Segments.BODY]: Joi.object({
		email: Joi.string().email().required(),
		name: Joi.string().min(2).max(60).required(),
		password: Joi.string().min(6).max(128).required(),
	}),
});

async function register(req, res, next) {
	try {
		const { email, name, password } = req.body;
		const result = await AuthService.registerUser({ email, name, password });
		return res.status(201).json(result);
	} catch (err) {
		return next(err);
	}
}

const validateLogin = celebrate({
	[Segments.BODY]: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).max(128).required(),
	}),
});

async function login(req, res, next) {
	try {
		const { email, password } = req.body;
		const result = await AuthService.loginUser({ email, password });
		return res.status(200).json(result);
	} catch (err) {
		return next(err);
	}
}

module.exports = { validateRegister, register, validateLogin, login };
