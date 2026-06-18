const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        sparse: true
    },
    action: {
        type: String,
        enum: ["CREATED", "SIGNED", "VIEWED", "DOWNLOADED", "SHARED", "REJECTED"],
        required: true
    },
    userEmail: {
        type: String,
        default: "ANONYMOUS"
    },
    userName: {
        type: String,
        sparse: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    details: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
        default: "SUCCESS"
    }
},
{ timestamps: false }
);

// Index for efficient queries
auditLogSchema.index({ documentId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
