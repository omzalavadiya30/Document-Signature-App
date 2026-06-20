const Document = require('../models/Document');
const { logAudit } = require("../services/audit.service");
const fs = require("fs");
const { uploadPdfToCloudinary } = require("../services/cloudinary.service");

// Upload PDF Document 
// Route: POST /api/docs/upload
const uploadDocument = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;

        if(!title?.trim()) {
            return res.status(400).json({ success: false, message: "Title is required" })
        }
        else if (!file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
        }
        const cloudinaryFile = await uploadPdfToCloudinary(file.path, "document-signature/original");

        const document = await Document.create({
            title: title.trim(),
            fileName: file.originalname,
            filePath: cloudinaryFile.secure_url,
            cloudinaryId: cloudinaryFile.public_id,
            owner: req.user.id
        });

        // Delete temporary local file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Log audit event
        await logAudit({
            documentId: document._id,
            userId: req.user.id,
            userEmail: req.user.email || `user-${req.user.id}`,
            userName: req.user.name,
            action: "CREATED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Document created: ${document.title} (${file.filename})`,
            status: "SUCCESS"
        });

        res.status(200).json({ success: true, document });
    } catch (error) {
        console.error("Upload Document Error: ", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * @desc Get all documents uploaded by logged-in user
 * @route GET /api/docs
 * @access Private
 */
const getDocuments = async(req, res) => {
    try {
        const documents = await Document.find({ owner: req.user.id }, {title: 1, fileName: 1, filePath: 1, status: 1, createdAt: 1, signedFileName: 1, signedFilePath: 1 }).sort({ createdAt: -1}).lean();
        res.status(200).json({ success: true, count: documents.length, documents });
    } catch(err) {
        console.error("Get Documents Error: ", err);
        res.status(500).json({ success: false, message: err.message })
    }
}

/**
 * @desc Get single document
 * @route GET /api/docs/:id
 * @access Private
 */
const getDocumentById= async(req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, owner: req.user.id}).lean();

        if(!document) {
            return res.status(404).json({ success: false, message: "Document Not Found" })
        }

        // Log audit event
        await logAudit({
            documentId: document._id,
            userId: req.user.id,
            userEmail: req.user.email || `user-${req.user.id}`,
            userName: req.user.name,
            action: "VIEWED",
            ipAddress: req.audit.ipAddress,
            userAgent: req.audit.userAgent,
            details: `Document viewed: ${document.title}`
        });

        res.status(200).json({ success: true, document})
    } catch(err) {
        console.error("Get Document Error: ", err);
        res.status(500).json({ success: false, message: err.message})
    }
}

module.exports = { uploadDocument, getDocuments, getDocumentById };