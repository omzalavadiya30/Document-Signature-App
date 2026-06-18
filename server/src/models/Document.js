const mongoose= require('mongoose');

// Document Schema: Stores uploaded PDF information
const documentSchema= new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Signed', 'Rejected'],
        default: 'Pending'
    },
    signedFileName: {
        type: String,
    },
    signedFilePath: {
        type: String,
    }
}, { timestamps: true });

// Optimized index for: Document.find({ owner }).sort({ createdAt: -1 })
documentSchema.index({ owner: -1, createdAt: -1 })

module.exports = mongoose.model('Document', documentSchema);