/**
 * Audit Middleware
 * Captures request information for audit logging
 * Attaches audit context to req.audit
 */
const auditMiddleware = (req, res, next) => {
    // Get IP address from various sources
    const ipAddress = 
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        "UNKNOWN";

    // Get user agent
    const userAgent = req.headers["user-agent"] || "UNKNOWN";

    // Attach audit context to request
    req.audit = {
        ipAddress: ipAddress.replace(/^::ffff:/, ""), // Remove IPv6 prefix if present
        userAgent: userAgent,
        userId: req.user?.id || null,
        userEmail: req.user?.email || "ANONYMOUS",
        userName: req.user?.name || null,
        timestamp: new Date()
    };

    next();
};

module.exports = { auditMiddleware };
