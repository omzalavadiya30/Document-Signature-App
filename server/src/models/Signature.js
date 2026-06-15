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
            required: true
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
        }
    },
    { timestamps: true }
);

// Find signatures by document
signatureSchema.index({ documentId: 1 })

module.exports= mongoose.model("Signature", signatureSchema)