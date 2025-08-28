const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema(
	{
		workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
		name: { type: String, required: true },
		phone: { type: String },
		type: { type: String, enum: ['customer', 'supplier'], required: true, index: true },
	},
	{ timestamps: true },
);

PartySchema.index({ workspaceId: 1, name: 1 }, { unique: false });

const Party = mongoose.models.Party || mongoose.model('Party', PartySchema);

module.exports = { Party };


