const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('../config/swagger');
const authRoutes = require('./auth.routes');

const router = Router();

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', authRoutes);

module.exports = router;
