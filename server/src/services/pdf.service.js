const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

// Generate Signed PDF
// Reads original PDF, Embeds signature text, Saves signed PDF
const generateSignedPdf= async({document, signature, signerName}) => {
    const absolutePath= path.join(process.cwd(), `src${document.filePath}`)
    const pdfBytes= fs.readFileSync(absolutePath)
    const pdfDoc= await PDFDocument.load(pdfBytes)
    const pages= pdfDoc.getPages();
    const page= pages[signature.page -1]

    // PDF coordinates start from bottom-left.
    const pdfWidth = page.getWidth();
    const pdfHeight = page.getHeight();

    const x = (signature.x / 100) * pdfWidth;
    const y = pdfHeight - ((signature.y / 100) * pdfHeight);
    
    console.log({ storedX: signature.x, storedY: signature.y, pdfWidth, pdfHeight, finalX: x, finalY: y });

    page.drawText(`Signed by ${signerName}`, { x, y, size: 14, color: rgb(0, 0, 1) })
    const signedPdfBytes= await pdfDoc.save();
    const signedFileName= `signed-${Date.now()}.pdf`;
    const signedFilePath = path.join(process.cwd(), "src", "uploads", "signed", signedFileName);

    fs.writeFileSync(signedFilePath, signedPdfBytes);

    return { fileName: signedFileName, filePath: `/uploads/signed/${signedFileName}` };
};

module.exports = { generateSignedPdf };