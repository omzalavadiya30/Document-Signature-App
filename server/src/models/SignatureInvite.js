const mongoose = require("mongoose");

const signatureInviteSchema = new mongoose.Schema(
{
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true
  },

  signerEmail: {
    type: String,
    required: true
  },

  token: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  },

  expiresAt: {
    type: Date,
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("SignatureInvite",signatureInviteSchema);