const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

/**
 * Workspace Middleware - Attach workspace to request
 * Ensures multi-tenant data isolation
 */
async function workspaceMiddleware(req, res, next) {
  try {
    // Get workspace ID from:
    // 1. Query parameter (?workspaceId=...)
    // 2. Header (X-Workspace-Id)
    // 3. JWT token (if workspace is embedded in token)

    let workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      req.params.workspaceId;

    if (!workspaceId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        workspaceId = decoded.workspaceId;
      } catch (error) {
        // Token doesn't have workspace info, continue without it
      }
    }

    if (!workspaceId) {
      // If no workspace ID found, allow request to continue
      // Controller will request workspaceId and handle error
      return next();
    }

    // Verify workspace exists and user has access
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found',
      });
    }

    // Check if user is member of workspace
    const userId = req.user?._id;
    if (userId && !workspace.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not a member of this workspace',
      });
    }

    // Attach workspace to request
    req.workspace = workspace;

    next();
  } catch (error) {
    console.error('Workspace middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Workspace validation failed',
      details: error.message,
    });
  }
}

module.exports = workspaceMiddleware;
