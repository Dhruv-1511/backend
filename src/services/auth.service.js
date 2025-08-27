const createHttpError = require('http-errors');
const { User } = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function registerUser(params) {
	const { email, name, password, routeRole } = params;
	const existing = await User.findOne({ email });
	if (existing) throw new createHttpError.Conflict('Email already registered');
	const passwordHash = await hashPassword(password);
	const user = await User.create({ email, name, passwordHash, role: routeRole || 'user' });
	const token = signToken({ userId: String(user._id), email: user.email });
	return { user: { id: String(user._id), email: user.email, name: user.name, role: user.role }, token };
}

async function loginUser(params) {
	const { email, password } = params;
	const user = await User.findOne({ email });
	if (!user) throw new createHttpError.Unauthorized('Invalid credentials');
	const ok = await verifyPassword(password, user.passwordHash);
	if (!ok) throw new createHttpError.Unauthorized('Invalid credentials');
	const token = signToken({ userId: String(user._id), email: user.email });
	return { user: { id: String(user._id), email: user.email, name: user.name, role: user.role }, token };
}

module.exports = { registerUser, loginUser };
