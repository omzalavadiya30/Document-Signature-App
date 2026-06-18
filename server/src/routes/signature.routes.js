const express= require("express");
const { saveSignature, getSignatures, finalizeSignature }= require("../controllers/signature.controller.js")
const { protect }= require("../middleware/auth.middleware.js")

const router= express.Router();

router.post("/", protect, saveSignature) // Save signature coordinates
router.get("/:documentId", protect, getSignatures) // Fetch signatures
router.post("/finalize", protect, finalizeSignature)

module.exports= router