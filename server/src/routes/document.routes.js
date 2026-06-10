const express = require('express');
const { uploadDocument } = require('../controllers/document.controller');
const{ protect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');
const router = express.Router();

router.post('/upload', protect, upload.single('document'), uploadDocument);
module.exports = router;