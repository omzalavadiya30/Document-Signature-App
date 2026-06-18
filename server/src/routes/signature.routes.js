const express= require("express");
const { saveSignature, getSignatures, finalizeSignature, inviteSigner, getPublicDocument }= require("../controllers/signature.controller.js")
const { acceptSignature, rejectSignature, getSignatureStatus, submitSignature } = require("../controllers/signature-action.controller.js")
const { protect }= require("../middleware/auth.middleware.js")

const router= express.Router();

// Protected routes (authenticated users)
router.post("/", protect, saveSignature) // Save signature coordinates
router.get("/:documentId", protect, getSignatures) // Fetch signatures
router.post("/finalize", protect, finalizeSignature)
router.post("/invite", protect, inviteSigner)

// Public routes (external signers)
router.post("/public/:token/accept", acceptSignature)
router.post("/public/:token/reject", rejectSignature)
router.get("/public/:token/status", getSignatureStatus)
router.post("/public/:token/submit", submitSignature)
router.get("/public/:token", getPublicDocument)

module.exports= router