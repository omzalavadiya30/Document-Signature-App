const express = require("express");
const { getDocumentAudit, getDocumentAuditStats, getAllAuditLogs } = require("../controllers/audit.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Get all audit logs (Admin only)
router.get("/", protect, getAllAuditLogs);

// Get audit logs for a specific document
router.get("/:documentId", protect, getDocumentAudit);

// Get audit statistics for a document
router.get("/:documentId/stats", protect, getDocumentAuditStats);

module.exports = router;
