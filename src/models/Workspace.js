const mongoose = require('mongoose');

const WorkspaceMemberSchema = new mongoose.Schema(
	{
		userEmail: { type: String, required: true, lowercase: true, index: true },
		role: { type: String, enum: ['owner', 'member'], default: 'member', required: true },
	},
	{ _id: false },
);

const WorkspaceSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		members: { type: [WorkspaceMemberSchema], default: [] },
	},
	{ timestamps: true },
);

const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

module.exports = { Workspace };


