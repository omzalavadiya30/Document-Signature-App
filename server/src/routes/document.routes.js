const express = require('express');
const { uploadDocument, getDocuments, getDocumentById } = require('../controllers/document.controller');
const{ protect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');
const router = express.Router();

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get("/", protect, getDocuments)
router.get("/:id", protect, getDocumentById)
module.exports = router;