const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspaceMember } = require('../middleware/workspace');
const { Party } = require('../models/Party');
const { Transaction } = require('../models/Transaction');

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use('/:workspaceId', requireWorkspaceMember);

/**
 * @openapi
 * /api/workspaces/{workspaceId}/parties:
 *   post:
 *     summary: Create party
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [customer, supplier]
 *     responses:
 *       201:
 *         description: Party created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
// Create party
router.post(
	'/:workspaceId/parties',
	celebrate({
		[Segments.BODY]: Joi.object({
			name: Joi.string().min(2).required(),
			phone: Joi.string().allow('', null),
			type: Joi.string().valid('customer', 'supplier').required(),
		}),
	}),
	async (req, res, next) => {
		try {
			const { name, phone, type } = req.body;
			const party = await Party.create({ workspaceId: req.params.workspaceId, name, phone, type });
			return res.status(201).json({ id: String(party._id) });
		} catch (err) {
			return next(err);
		}
	},
);

/**
 * @openapi
 * /api/workspaces/{workspaceId}/parties:
 *   get:
 *     summary: List parties with totals
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [customer, supplier]
 *     responses:
 *       200:
 *         description: List of parties with totals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   willGive:
 *                     type: number
 *                   willGet:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 */
// List parties by type with totals (willGive/willGet per party)
router.get('/:workspaceId/parties', async (req, res, next) => {
	try {
		const { workspaceId } = req.params;
		const { type } = req.query; // optional filter
		const parties = await Party.find({ workspaceId, ...(type ? { type } : {}) }).sort({ createdAt: -1 });
		const partyIds = parties.map((p) => String(p._id));
		const txs = await Transaction.find({ workspaceId, partyId: { $in: partyIds } });
		const totalsByParty = new Map();
		txs.forEach((t) => {
			const id = String(t.partyId);
			const p = parties.find((pp) => String(pp._id) === id);
			const isCustomer = p?.type === 'customer';
			const totals = totalsByParty.get(id) || { willGive: 0, willGet: 0 };
			if (isCustomer) {
				if (t.direction === 'gave') totals.willGet += t.amount; else totals.willGive += t.amount;
			} else {
				if (t.direction === 'gave') totals.willGive += t.amount; else totals.willGet += t.amount;
			}
			totalsByParty.set(id, totals);
		});
		const data = parties.map((p) => ({
			id: String(p._id),
			name: p.name,
			type: p.type,
			phone: p.phone,
			...totalsByParty.get(String(p._id)),
		}));
		return res.json(data);
	} catch (err) {
		return next(err);
	}
});

/**
 * @openapi
 * /api/workspaces/{workspaceId}/parties/{partyId}:
 *   get:
 *     summary: Party detail with history
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: partyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Party details with transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Party not found
 */
// Party detail with transaction history
router.get('/:workspaceId/parties/:partyId', async (req, res, next) => {
	try {
		const { workspaceId, partyId } = req.params;
		const party = await Party.findOne({ _id: partyId, workspaceId });
		if (!party) return res.status(404).json({ message: 'Party not found' });
		const txs = await Transaction.find({ workspaceId, partyId }).sort({ date: -1 });
		return res.json({
			id: String(party._id),
			name: party.name,
			type: party.type,
			phone: party.phone,
			transactions: txs,
		});
	} catch (err) {
		return next(err);
	}
});

module.exports = router;


