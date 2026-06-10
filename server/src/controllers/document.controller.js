const Document = require('../models/Document');

const uploadDocument = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
        }
        const document = await Document.create({
            title,
            fileName: file.filename,
            filePath: file.path,
            owner: req.user.id
        });
        res.status(201).json({ success: true, document });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { uploadDocument };