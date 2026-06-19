"use client"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc= `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    fileUrl: string;
}

// Renders uploaded PDF.
const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
    const [numPages, setNumPages]= useState(0);
    const [pageWidth, setPageWidth] = useState(900);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const updatePageWidth = () => {
            const containerWidth = containerRef.current?.clientWidth || 900;
            setPageWidth(Math.min(Math.max(containerWidth, 320), 900));
        };

        updatePageWidth();

        const resizeObserver = new ResizeObserver(updatePageWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="relative w-full overflow-x-auto">
            <Document
                file={fileUrl}
                onLoadSuccess={({numPages}) => setNumPages(numPages)}
                onLoadError={(err) => console.error("PDF Load Error: ", err)}
                loading={<div className="flex min-h-96 items-center justify-center text-sm text-slate-500">Loading PDF...</div>}
                className="space-y-4"
            >
                {
                    Array.from({ length: numPages }, (_, index) => (
                        <Page key={index} pageNumber={index + 1} width={pageWidth} />
                    ))
                }
            </Document>
        </div>
    )
}

export default PdfViewer
