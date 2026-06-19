const Signature = require("../models/Signature");
const Document = require("../models/Document");
const User = require('../models/User');
const { generateSignedPdf } = require("../services/pdf.service");
const generateToken = require("../utils/generateToken");
const SignatureInvite = require("../models/SignatureInvite");
const { sendSignatureEmail } = require("../services/email.service");
const { logAudit } = require("../services/audit.service");

/**
 * @desc Save Signature Position
 * @route POST /api/signatures
 * @access Private
 */
const saveSignature = async (req, res) => {
    try {
        const { documentId, page, x, y } = req.body;

        if (!documentId || x === undefined || y === undefined) {
            return res.status(400).json({ success: false, message: "Document ID and coordinates are required" });
        }

        const signature = await Signature.findOneAndUpdate(
            { documentId, signer: req.user.id },
            { page, x, y },
            { returnDocument: 'after', upsert: true }
        );

        await logAudit({
            documentId,
            userId: req.user.id,
            userEmail: req.user.email || `user-${req.user.id}`,
            userName: req.user.name,
            action: "VIEWED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Signature position updated - Page: ${page}, X: ${x}, Y: ${y}`
        });

        return res.status(200).json({ success: true, signature });
    } catch (err) {
        console.error("Signature Error: ", err);
        return res.status(500).json({ success: false, message: "Failed to save Signature" });
    }
};

/**
 * @desc Get Document Signatures
 * @route GET /api/signatures/:documentId
 * @access Private
 */
const getSignatures = async (req, res) => {
    try {
        const signatures = await Signature.find({ documentId: req.params.documentId }).lean();
        return res.status(200).json({ success: true, signatures });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch signatures" });
    }
};

/**
 * @desc Generate Signed PDF
 * @route POST /api/signatures/finalize
 * @access Private
 */
const finalizeSignature = async (req, res) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: "Document not Found" });
        }

        const signature = await Signature.findOne({ documentId, signer: req.user.id }).sort({ updatedAt: -1 });
        const user = await User.findById(req.user.id);
        const signerName = user?.name || "User";

        if (!signature) {
            return res.status(404).json({ success: false, message: "Signature not Found" });
        }

        const signedPdf = await generateSignedPdf({ document, signature, signerName });

        document.signedFileName = signedPdf.fileName;
        document.signedFilePath = signedPdf.filePath;
        document.status = "Signed";
        await document.save();

        signature.status = "Signed";
        await signature.save();

        await logAudit({
            documentId,
            userId: req.user.id,
            userEmail: req.user.email || `user-${req.user.id}`,
            userName: req.user.name,
            action: "SIGNED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Document signed by ${signerName}`,
            status: "SUCCESS"
        });

        return res.status(200).json({ success: true, signedPdf });
    } catch (err) {
        console.error("Finalize Signature Error:", err);

        if (req.body?.documentId && req.user?.id) {
            await logAudit({
                documentId: req.body.documentId,
                userId: req.user.id,
                userEmail: req.user.email || `user-${req.user.id}`,
                userName: req.user.name,
                action: "SIGNED",
                ipAddress: req.audit.ipAddress,
                userAgent: req.audit.userAgent,
                details: err.message,
                status: "FAILED"
            });
        }

        return res.status(500).json({ success: false, message: err.message || "Failed to generate signed PDF" });
    }
};

/**
 * Invite signer via email
 * @route POST /api/signatures/invite
 * @access Private
 */
const inviteSigner = async (req, res) => {
    try {
        const { documentId, signerEmail } = req.body;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        const token = generateToken();
        const invite = await SignatureInvite.create({
            documentId,
            signerEmail,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        const signatureLink = `${process.env.CLIENT_URL}/sign/public/${token}`;

        await sendSignatureEmail({ email: signerEmail, documentTitle: document.title, signatureLink });

        await logAudit({
            documentId,
            userId: req.user.id,
            userEmail: req.user.email || `user-${req.user.id}`,
            userName: req.user.name,
            action: "SHARED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Invitation sent to ${signerEmail}`,
            status: "SUCCESS"
        });

        return res.status(200).json({ success: true, invite });
    } catch (error) {
        console.error(error);

        if (req.body?.documentId && req.user?.id) {
            await logAudit({
                documentId: req.body.documentId,
                userId: req.user.id,
                userEmail: req.user.email || `user-${req.user.id}`,
                userName: req.user.name,
                action: "SHARED",
                ipAddress: req.audit.ipAddress,
                userAgent: req.audit.userAgent,
                details: error.message,
                status: "FAILED"
            });
        }

        return res.status(500).json({ success: false, message: "Failed to send invitation" });
    }
};

/**
 * @desc Get public document via invite token
 * @route GET /api/signatures/public/:token
 * @access Public
 */
const getPublicDocument = async (req, res) => {
    try {
        const invite = await SignatureInvite.findOne({ token: req.params.token });

        if (!invite) {
            return res.status(404).json({ success: false, message: "Invalid Link" });
        }

        if (invite.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "Link Expired" });
        }

        const document = await Document.findById(invite.documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        await logAudit({
            documentId: invite.documentId,
            userEmail: invite.signerEmail,
            action: "VIEWED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Public document access via token`,
            status: "SUCCESS"
        });

        return res.status(200).json({ success: true, document });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to retrieve document" });
    }
};

module.exports = { saveSignature, getSignatures, finalizeSignature, inviteSigner, getPublicDocument };
