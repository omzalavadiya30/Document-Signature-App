const mongoose= require("mongoose");

// Signature Schema: Stores signature position for a document.
const signatureSchema= new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true
        },

        signer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        signerEmail: {
            type: String,
            default: null
        },

        page: {
            type: Number,
            required: true
        },

        x: {
            type: Number,
            required: true
        },

        y: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [ "Pending", "Signed", "Rejected"],
            default: "Pending"
        },

        rejectionReason: {
            type: String,
            default: null,
            sparse: true
        },

        rejectedAt: {
            type: Date,
            default: null,
            sparse: true
        },

        signedAt: {
            type: Date,
            default: null,
            sparse: true
        }
    },
    { timestamps: true }
);

// Find signatures by document
signatureSchema.index({ documentId: 1 })
signatureSchema.index({ documentId: 1, status: 1 })

module.exports= mongoose.model("Signature", signatureSchema)
