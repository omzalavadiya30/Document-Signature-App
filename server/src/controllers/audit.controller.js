const Document = require("../models/Document");
const { getAuditLogs, getAuditStatistics } = require("../services/audit.service");

/**
 * @desc Get audit logs for a document
 * @route GET /api/audit/:documentId
 * @access Private
 */
const getDocumentAudit = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { skip = 0, limit = 50 } = req.query;

        // Verify document exists
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        // Verify ownership (user must be the document owner or admin)
        if (document.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized to view audit logs" });
        }

        // Get audit logs
        const auditData = await getAuditLogs(documentId, {
            skip: parseInt(skip),
            limit: parseInt(limit)
        });

        return res.status(200).json({
            success: true,
            logs: auditData.logs,
            pagination: {
                total: auditData.total,
                skip: auditData.skip,
                limit: auditData.limit,
                hasMore: auditData.hasMore
            }
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
    }
};

/**
 * @desc Get audit statistics for a document
 * @route GET /api/audit/:documentId/stats
 * @access Private
 */
const getDocumentAuditStats = async (req, res) => {
    try {
        const { documentId } = req.params;

        // Verify document exists
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        // Verify ownership
        if (document.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized to view audit statistics" });
        }

        // Get statistics
        const stats = await getAuditStatistics(documentId);

        return res.status(200).json({
            success: true,
            document: {
                _id: document._id,
                title: document.title
            },
            statistics: stats
        });
    } catch (error) {
        console.error("Error fetching audit statistics:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch audit statistics" });
    }
};

/**
 * @desc Get all audit logs (Admin only)
 * @route GET /api/audit
 * @access Private/Admin
 */
const getAllAuditLogs = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        const { skip = 0, limit = 50, action, userId } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (userId) filter.userId = userId;

        const AuditLog = require("../models/AuditLog");
        const logs = await AuditLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .lean();

        const total = await AuditLog.countDocuments(filter);

        return res.status(200).json({
            success: true,
            logs,
            pagination: {
                total,
                skip: parseInt(skip),
                limit: parseInt(limit),
                hasMore: parseInt(skip) + logs.length < total
            }
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
    }
};

module.exports = { getDocumentAudit, getDocumentAuditStats, getAllAuditLogs};