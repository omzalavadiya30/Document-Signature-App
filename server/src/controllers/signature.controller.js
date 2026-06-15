const Signature = require("../models/Signature");

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

        const signature= await Signature.create({ documentId, signer: req.user.id, page, x, y});

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

module.exports= { saveSignature, getSignatures }