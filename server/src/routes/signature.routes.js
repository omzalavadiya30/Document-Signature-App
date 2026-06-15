const express= require("express");
const { saveSignature, getSignatures }= require("../controllers/signature.controller.js")
const { protect }= require("../middleware/auth.middleware.js")

const router= express.Router();

router.post("/", protect, saveSignature) // Save signature coordinates
router.get("/:documentId", protect, getSignatures) // Fetch signatures

module.exports= router