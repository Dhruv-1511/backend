const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		name: { type: String, required: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
	},
	{ timestamps: true },
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = { User };
