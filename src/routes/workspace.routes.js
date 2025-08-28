const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth } = require('../middleware/auth');
const { Workspace } = require('../models/Workspace');
const { Party } = require('../models/Party');
const { Transaction } = require('../models/Transaction');

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     summary: Create a workspace
 *     tags: [Workspace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Create workspace
router.post(
	'/',
	celebrate({
		[Segments.BODY]: Joi.object({
			name: Joi.string().min(2).required(),
			members: Joi.array().items(Joi.string().email()).default([]),
		}),
	}),
	async (req, res, next) => {
		try {
			const { name, members } = req.body;
			const doc = await Workspace.create({
				name,
				ownerId: req.user.userId,
				members: members.map((email) => ({ userEmail: email, role: 'member' })),
			});
			return res.status(201).json({ id: String(doc._id), name: doc.name });
		} catch (err) {
			return next(err);
		}
	},
);

/**
 * @openapi
 * /api/workspaces/mine:
 *   get:
 *     summary: List my workspaces
 *     tags: [Workspace]
 *     responses:
 *       200:
 *         description: List of workspaces
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
 *       401:
 *         description: Unauthorized
 */
// List workspaces for current user (owner or invited)
router.get('/mine', async (req, res, next) => {
	try {
		const email = req.user.email;
		const data = await Workspace.find({
			$or: [{ ownerId: req.user.userId }, { members: { $elemMatch: { userEmail: email } } }],
		})
			.select('name createdAt')
			.sort({ createdAt: -1 });
		return res.json(data.map((d) => ({ id: String(d._id), name: d.name })));
	} catch (err) {
		return next(err);
	}
});

/**
 * @openapi
 * /api/workspaces/{workspaceId}/home:
 *   get:
 *     summary: Workspace home summary
 *     tags: [Workspace]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totals:
 *                   type: object
 *                   properties:
 *                     willGive:
 *                       type: number
 *                     willGet:
 *                       type: number
 *                 recent:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Workspace not found
 *       401:
 *         description: Unauthorized
 */
// Home summary: totals to give and get, recent transactions
router.get('/:workspaceId/home', async (req, res, next) => {
	try {
		const { workspaceId } = req.params;
		// Aggregate totals by party type
		const parties = await Party.find({ workspaceId }).select('_id type');
		const partyTypeById = new Map(parties.map((p) => [String(p._id), p.type]));
		const txs = await Transaction.find({ workspaceId }).sort({ date: -1 }).limit(20);
		let totalGive = 0;
		let totalGet = 0;
		txs.forEach((t) => {
			const type = partyTypeById.get(String(t.partyId));
			if (type === 'customer') {
				// You will get from customers when you gave money; you will give when you got
				if (t.direction === 'gave') totalGet += t.amount; else totalGive += t.amount;
			} else if (type === 'supplier') {
				// Opposite semantics for suppliers
				if (t.direction === 'gave') totalGive += t.amount; else totalGet += t.amount;
			}
		});
		return res.json({ totals: { willGive: totalGive, willGet: totalGet }, recent: txs });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;


