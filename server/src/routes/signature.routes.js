const express= require("express");
const { saveSignature, getSignatures, finalizeSignature, inviteSigner, getPublicDocument }= require("../controllers/signature.controller.js")
const { protect }= require("../middleware/auth.middleware.js")

const router= express.Router();

router.post("/", protect, saveSignature) // Save signature coordinates
router.get("/:documentId", protect, getSignatures) // Fetch signatures
router.post("/finalize", protect, finalizeSignature)
router.post("/invite", protect, inviteSigner)
router.get("/public/:token", getPublicDocument)

module.exports= router