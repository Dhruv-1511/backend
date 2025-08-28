const createHttpError = require('http-errors');
const { Workspace } = require('../models/Workspace');

async function requireWorkspaceMember(req, _res, next) {
	try {
		const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
		if (!workspaceId) return next(new createHttpError.BadRequest('workspaceId is required'));
		const ws = await Workspace.findById(workspaceId);
		if (!ws) return next(new createHttpError.NotFound('Workspace not found'));
		const email = req.user?.email;
		const isMember = email && (ws.ownerId?.toString() === req.user.userId || ws.members.some((m) => m.userEmail === email));
		if (!isMember) return next(new createHttpError.Forbidden('Not a member of this workspace'));
		req.workspace = ws;
		return next();
	} catch (err) {
		return next(err);
	}
}

module.exports = { requireWorkspaceMember };


