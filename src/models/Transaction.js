const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
	{
		workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
		partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
		amount: { type: Number, required: true, min: 0 },
		direction: { type: String, enum: ['gave', 'got'], required: true },
		description: { type: String },
		date: { type: Date, required: true },
		billImageUrl: { type: String },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true },
);

TransactionSchema.index({ workspaceId: 1, partyId: 1, date: -1 });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

module.exports = { Transaction };


