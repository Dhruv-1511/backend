const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspaceMember } = require('../middleware/workspace');
const { Transaction } = require('../models/Transaction');
const { Party } = require('../models/Party');

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use('/:workspaceId', requireWorkspaceMember);

/**
 * @openapi
 * /api/workspaces/{workspaceId}/parties/{partyId}/transactions:
 *   post:
 *     summary: Create transaction (You gave/You got)
 *     tags: [Transaction]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, direction, date]
 *             properties:
 *               amount:
 *                 type: number
 *               direction:
 *                 type: string
 *                 enum: [gave, got]
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               billImageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
 *         description: Party not found
 */
// Create transaction (You gave / You got)
router.post(
	'/:workspaceId/parties/:partyId/transactions',
	celebrate({
		[Segments.BODY]: Joi.object({
			amount: Joi.number().positive().required(),
			direction: Joi.string().valid('gave', 'got').required(),
			description: Joi.string().allow('', null),
			date: Joi.date().required(),
			billImageUrl: Joi.string().uri().allow('', null),
		}),
	}),
	async (req, res, next) => {
		try {
			const { workspaceId, partyId } = req.params;
			const party = await Party.findOne({ _id: partyId, workspaceId });
			if (!party) return res.status(404).json({ message: 'Party not found' });
			const tx = await Transaction.create({
				workspaceId,
				partyId,
				amount: req.body.amount,
				direction: req.body.direction,
				description: req.body.description,
				date: req.body.date,
				billImageUrl: req.body.billImageUrl || undefined,
				createdBy: req.user.userId,
			});
			return res.status(201).json({ id: String(tx._id) });
		} catch (err) {
			return next(err);
		}
	},
);

/**
 * @openapi
 * /api/workspaces/{workspaceId}/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by id
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 direction:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                 billImageUrl:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
// Get transaction
router.get('/:workspaceId/transactions/:transactionId', async (req, res, next) => {
	try {
		const { workspaceId, transactionId } = req.params;
		const tx = await Transaction.findOne({ _id: transactionId, workspaceId });
		if (!tx) return res.status(404).json({ message: 'Transaction not found' });
		return res.json(tx);
	} catch (err) {
		return next(err);
	}
});

/**
 * @openapi
 * /api/workspaces/{workspaceId}/transactions/{transactionId}:
 *   put:
 *     summary: Update transaction
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               direction:
 *                 type: string
 *                 enum: [gave, got]
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               billImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 direction:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                 billImageUrl:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
// Update transaction
router.put(
	'/:workspaceId/transactions/:transactionId',
	celebrate({
		[Segments.BODY]: Joi.object({
			amount: Joi.number().positive(),
			direction: Joi.string().valid('gave', 'got'),
			description: Joi.string().allow('', null),
			date: Joi.date(),
			billImageUrl: Joi.string().uri().allow('', null),
		}).min(1),
	}),
	async (req, res, next) => {
		try {
			const { workspaceId, transactionId } = req.params;
			const tx = await Transaction.findOneAndUpdate({ _id: transactionId, workspaceId }, req.body, { new: true });
			if (!tx) return res.status(404).json({ message: 'Transaction not found' });
			return res.json(tx);
		} catch (err) {
			return next(err);
		}
	},
);

/**
 * @openapi
 * /api/workspaces/{workspaceId}/transactions/{transactionId}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
// Delete transaction
router.delete('/:workspaceId/transactions/:transactionId', async (req, res, next) => {
	try {
		const { workspaceId, transactionId } = req.params;
		const result = await Transaction.findOneAndDelete({ _id: transactionId, workspaceId });
		if (!result) return res.status(404).json({ message: 'Transaction not found' });
		return res.status(204).send();
	} catch (err) {
		return next(err);
	}
});

module.exports = router;


