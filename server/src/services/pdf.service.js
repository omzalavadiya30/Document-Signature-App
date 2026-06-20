const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const axios = require("axios");
const { uploadPdfToCloudinary } = require("./cloudinary.service");

// Generate Signed PDF
// Reads original PDF, Embeds signature text, Saves signed PDF
const generateSignedPdf= async({document, signature, signerName}) => {
    const response = await axios.get(document.filePath, { responseType: "arraybuffer" });
    const pdfBytes = response.data;
    const pdfDoc= await PDFDocument.load(pdfBytes)
    const pages= pdfDoc.getPages();
    const page= pages[signature.page -1]

    // PDF coordinates start from bottom-left.
    const pdfWidth = page.getWidth();
    const pdfHeight = page.getHeight();

    const x = (signature.x / 100) * pdfWidth;
    const y = pdfHeight - ((signature.y / 100) * pdfHeight);

    page.drawText(`Signed by ${signerName}`, { x, y, size: 14, color: rgb(0, 0, 1) })
    const signedPdfBytes= await pdfDoc.save();
    const signedFileName= `signed-${Date.now()}.pdf`;
    const tempPath = path.join(process.cwd(),signedFileName);
    fs.writeFileSync(tempPath, signedPdfBytes);
    
    // Upload signed PDF
    const signedCloudinary  = await uploadPdfToCloudinary(tempPath, "document-signature/signed");

    if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
    }

    return {
        fileName: signedFileName,
        filePath: signedCloudinary .secure_url,
        cloudinaryId: signedCloudinary .public_id
    };
};

module.exports = { generateSignedPdf };