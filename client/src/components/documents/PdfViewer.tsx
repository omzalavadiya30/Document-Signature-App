"use client"
import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc= `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    fileUrl: string;
}

// Renders uploaded PDF.
const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
    const [numPages, setNumPages]= useState(0);

    return (
        <div className="relative inline-block">
            <Document file={fileUrl} onLoadSuccess={({numPages}) => setNumPages(numPages)} onLoadError={(err) => console.error("PDF Load Error: ", err)}>
                {
                    Array.from({ length: numPages }, (_, index) => (
                        <Page key={index} pageNumber={index + 1} width={900} />
                    ))
                }
            </Document>
        </div>
    )
}

export default PdfViewer
