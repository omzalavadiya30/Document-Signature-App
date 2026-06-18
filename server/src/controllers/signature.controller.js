const Signature = require("../models/Signature");
const Document = require("../models/Document");
const User= require('../models/User')
const { generateSignedPdf } = require("../services/pdf.service");

/**
 * @desc Save Signature Position 
 * @route POST /api/signatures
 * @access Private
 */
const saveSignature= async(req, res) => {
    try {
        const { documentId, page, x, y }= req.body;

        if(!documentId || x === undefined || y === undefined) {
            return res.status(400).json({ success: false, message: "Document ID and coordinates are required" })
        }

        const signature= await Signature.findOneAndUpdate({ documentId, signer: req.user.id},{ page, x, y }, { new: true, upsert: true });

        return res.status(200).json({ success: true, signature });
    } catch(err) {
        console.error("Signature Error: ", err);
        return res.status(500).json({ success: false, message: "Failed to save Signature"})
    }
}

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
const finalizeSignature= async(req, res) => {
    try {
        const { documentId }= req.body
        const document= await Document.findById(documentId)
        if(!document) {
            return res.status(404).json({ success: false, message: "Document not Found"})
        }
        const signature= await Signature.findOne({ documentId, signer: req.user.id }).sort({ updatedAt: -1 })
        const user= await User.findById(req.user.id)
        const signerName= user.name
        
        if(!signature) {
            return res.status(404).json({ success: false, message: "Signature not Found"})
        }

        const signedPdf= await generateSignedPdf({ document, signature, signerName: signerName || "User" })

        document.signedFileName= signedPdf.fileName;
        document.signedFilePath= signedPdf.filePath;
        document.status= "Signed";
        await document.save();

        signature.status="Signed";
        await signature.save();

        return res.status(200).json({success: true, signedPdf})
    } catch(err) {
        console.error("Finalize Signature Error:", err);
        return res.status(500).json({success: false, messsage: err.message || "Failed to generate signed PDF"})
    }
}

module.exports= { saveSignature, getSignatures, finalizeSignature }