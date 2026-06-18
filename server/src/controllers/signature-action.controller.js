const Signature = require("../models/Signature");
const SignatureInvite = require("../models/SignatureInvite");
const Document = require("../models/Document");
const { logAudit } = require("../services/audit.service");

const getValidInvite = async (token) => {
    const invite = await SignatureInvite.findOne({ token });
    if (!invite) {
        return { status: 404, message: "Invalid invitation link" };
    }

    if (invite.expiresAt < new Date()) {
        return { status: 400, message: "Invitation has expired" };
    }

    const document = await Document.findById(invite.documentId);
    if (!document) {
        return { status: 404, message: "Document not found" };
    }

    return { invite, document };
};

const findOrCreateEmailSignature = async (invite, values = {}) => {
    const signature = await Signature.findOne({
        documentId: invite.documentId,
        signerEmail: invite.signerEmail
    });

    if (signature) {
        Object.assign(signature, values);
        return signature.save();
    }

    return Signature.create({
        documentId: invite.documentId,
        signerEmail: invite.signerEmail,
        page: values.page || 1,
        x: values.x || 50,
        y: values.y || 50,
        ...values
    });
};

/**
 * @desc Accept a signature invitation
 * @route POST /api/signatures/public/:token/accept
 * @access Public
 */
const acceptSignature = async (req, res) => {
    try {
        const { token } = req.params;

        const result = await getValidInvite(token);
        if (!result.invite) {
            return res.status(result.status).json({ success: false, message: result.message });
        }

        const { invite, document } = result;

        if (document.status === "Signed") {
            return res.status(400).json({ success: false, message: "Document has already been signed" });
        }

        const signature = await findOrCreateEmailSignature(invite, {
            status: "Signed",
            rejectionReason: null,
            rejectedAt: null,
            signedAt: new Date()
        });

        invite.status = "Signed";
        await invite.save();

        document.status = "Signed";
        await document.save();

        await logAudit({
            documentId: invite.documentId,
            userEmail: invite.signerEmail,
            action: "SIGNED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: "Signer accepted and signed the signature request",
            status: "SUCCESS"
        });

        return res.status(200).json({
            success: true,
            message: "Signature request accepted and signed.",
            signature
        });
    } catch (error) {
        console.error("Accept Signature Error:", error);
        return res.status(500).json({ success: false, message: "Failed to accept signature invitation" });
    }
};

/**
 * @desc Reject a signature invitation
 * @route POST /api/signatures/public/:token/reject
 * @access Public
 */
const rejectSignature = async (req, res) => {
    try {
        const { token } = req.params;
        const { reason } = req.body;
        const rejectionReason = reason?.trim();

        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required" });
        }

        const result = await getValidInvite(token);
        if (!result.invite) {
            return res.status(result.status).json({ success: false, message: result.message });
        }

        const { invite, document } = result;

        if (document.status === "Signed") {
            return res.status(400).json({ success: false, message: "Document has already been signed" });
        }

        const signature = await findOrCreateEmailSignature(invite, {
            status: "Rejected",
            rejectionReason,
            rejectedAt: new Date(),
            signedAt: null
        });

        invite.status = "Rejected";
        await invite.save();

        document.status = "Rejected";
        await document.save();

        await logAudit({
            documentId: invite.documentId,
            userEmail: invite.signerEmail,
            action: "REJECTED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Signature rejected. Reason: ${rejectionReason}`,
            status: "SUCCESS"
        });

        return res.status(200).json({
            success: true,
            message: "Signature invitation rejected successfully.",
            signature
        });
    } catch (error) {
        console.error("Reject Signature Error:", error);
        return res.status(500).json({ success: false, message: "Failed to reject signature invitation" });
    }
};

/**
 * @desc Get signature status for external signer
 * @route GET /api/signatures/public/:token/status
 * @access Public
 */
const getSignatureStatus = async (req, res) => {
    try {
        const { token } = req.params;

        const invite = await SignatureInvite.findOne({ token });
        if (!invite) {
            return res.status(404).json({ success: false, message: "Invalid invitation link" });
        }

        const signature = await Signature.findOne({
            documentId: invite.documentId,
            signerEmail: invite.signerEmail
        });

        return res.status(200).json({
            success: true,
            status: signature?.status || "Pending",
            rejectionReason: signature?.rejectionReason || null,
            signedAt: signature?.signedAt || null,
            rejectedAt: signature?.rejectedAt || null,
            inviteStatus: invite.status
        });
    } catch (error) {
        console.error("Get Signature Status Error:", error);
        return res.status(500).json({ success: false, message: "Failed to get signature status" });
    }
};

/**
 * @desc Submit signature (finalize)
 * @route POST /api/signatures/public/:token/submit
 * @access Public
 */
const submitSignature = async (req, res) => {
    try {
        const { token } = req.params;
        const { coordinates } = req.body;

        if (!Array.isArray(coordinates) || coordinates.length === 0) {
            return res.status(400).json({ success: false, message: "Signature coordinates required" });
        }

        const result = await getValidInvite(token);
        if (!result.invite) {
            return res.status(result.status).json({ success: false, message: result.message });
        }

        const { invite, document } = result;

        let signature = await Signature.findOne({
            documentId: invite.documentId,
            signerEmail: invite.signerEmail
        });

        if (!signature) {
            return res.status(404).json({ success: false, message: "Signature not found" });
        }

        if (signature.status === "Rejected") {
            return res.status(400).json({ success: false, message: "Rejected signature requests cannot be submitted" });
        }

        signature.status = "Signed";
        signature.signedAt = new Date();
        signature.rejectionReason = null;
        signature.rejectedAt = null;

        if (coordinates.length > 0) {
            signature.page = coordinates[0].page || 1;
            signature.x = coordinates[0].x || 50;
            signature.y = coordinates[0].y || 50;
        }

        await signature.save();

        invite.status = "Signed";
        await invite.save();

        document.status = "Signed";
        await document.save();

        await logAudit({
            documentId: invite.documentId,
            userEmail: invite.signerEmail,
            action: "SIGNED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Signature submitted and finalized`,
            status: "SUCCESS"
        });

        return res.status(200).json({
            success: true,
            message: "Signature submitted successfully!",
            signature
        });
    } catch (error) {
        console.error("Submit Signature Error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit signature" });
    }
};

module.exports = {
    acceptSignature,
    rejectSignature,
    getSignatureStatus,
    submitSignature
};
