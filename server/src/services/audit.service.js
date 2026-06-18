const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

/**
 * Log an audit event
 * @param {Object} options - Audit log options
 * @param {String} options.documentId - Document ID
 * @param {String} options.userId - User ID (optional)
 * @param {String} options.userEmail - User email
 * @param {String} options.userName - User name (optional)
 * @param {String} options.action - Action type (CREATED, SIGNED, VIEWED, DOWNLOADED, SHARED, REJECTED)
 * @param {String} options.ipAddress - IP address
 * @param {String} options.userAgent - User agent
 * @param {String} options.details - Additional details
 * @param {String} options.status - SUCCESS or FAILED
 */
const logAudit = async (options) => {
    try {
        const { documentId, userId, userEmail, userName, action, ipAddress, userAgent, details, status = "SUCCESS" } = options;
        const auditLog = await AuditLog.create({ documentId, userId, userEmail, userName, action, ipAddress, userAgent, details, status, timestamp: new Date()});
        console.log(`✅ Audit logged: ${action} for document ${documentId}`);
        return auditLog;
    } catch (error) {
        console.error("❌ Error logging audit:", error.message);
        // Don't throw - audit logging failures shouldn't break the application
        return null;
    }
};

/**
 * Get audit logs for a document
 * @param {String} documentId - Document ID
 * @param {Object} options - Query options
 * @param {Number} options.skip - Skip count
 * @param {Number} options.limit - Limit count
 */
const getAuditLogs = async (documentId, options = {}) => {
    try {
        const { skip = 0, limit = 50 } = options;
        const logs = await AuditLog.find({ documentId }).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
        const total = await AuditLog.countDocuments({ documentId });

        return { logs, total, skip, limit, hasMore: skip + logs.length < total};
    } catch (error) {
        console.error("Error fetching audit logs:", error.message);
        throw error;
    }
};

/**
 * Get audit logs for a user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 */
const getUserAuditLogs = async (userId, options = {}) => {
    try {
        const { skip = 0, limit = 50 } = options;
        const logs = await AuditLog.find({ userId }).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
        const total = await AuditLog.countDocuments({ userId });

        return { logs, total, skip, limit, hasMore: skip + logs.length < total};
    } catch (error) {
        console.error("Error fetching user audit logs:", error.message);
        throw error
    }
};

/**
 * Get audit logs by action
 * @param {String} action - Action type
 * @param {Object} options - Query options
 */
const getAuditLogsByAction = async (action, options = {}) => {
    try {
        const { skip = 0, limit = 50 } = options;
        const logs = await AuditLog.find({ action }).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
        const total = await AuditLog.countDocuments({ action });

        return { logs, total, skip, limit, hasMore: skip + logs.length < total };
    } catch (error) {
        console.error("Error fetching audit logs by action:", error.message);
        throw error;
    }
};

/**
 * Get audit statistics for a document
 */
const getAuditStatistics = async (documentId) => {
    try {
        const stats = await AuditLog.aggregate([
            {
                $match: { documentId: mongoose.Types.ObjectId(documentId) }
            },
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        return stats;
    } catch (error) {
        console.error("Error fetching audit statistics:", error.message);
        throw error;
    }
};

module.exports = { logAudit, getAuditLogs, getUserAuditLogs, getAuditLogsByAction, getAuditStatistics };