const mongoose= require('mongoose');

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
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);