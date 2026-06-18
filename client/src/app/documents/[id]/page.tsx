"use client"
import { getDocument } from '@/services/document.service';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { finalizeSignature, getSignatures, saveSignature } from '@/services/signature.service';
import { Signature } from '@/types/signature.types';
import SignaturePlaceholder from '@/components/signature/SignaturePlaceholder';
import { Document } from '@/types/document.types';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import DraggableSignature from '@/components/signature/DraggableSignature';

const PdfViewer= dynamic(() => import("@/components/documents/PdfViewer"), { ssr: false })

// Document Details. Page Displays single document and PDF preview.
const DocumentPage = () => {
    const { id }= useParams();

    const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [loading, setLoading]= useState(true);
    const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 100})

    useEffect(() => {
        if(!id) return
        const initializePage = async () => {
            await Promise.all([loadDocument(), loadSignatures()]);
        };

        void initializePage();
    }, [id]);

    // Fetch current document details.
    const loadDocument= async() => {
        try {
            const data= await getDocument(id as string);
            setCurrentDocument(data.document)
        } catch(err) {
            console.error("Load Document Error: ", err);
            toast.error("Failed to load Document")
        } finally {
            setLoading(false)
        }
    }

    // Fetch saved signatures for the current document.
    const loadSignatures = async () => {
        try {
            const data = await getSignatures(id as string);
            setSignatures(data.signatures);
        } catch (error) {
            console.error("Load Signatures Error:",error);
        }
    };
    
    // Stores draggable coordinates in MongoDB.
    const saveSignaturePosition = async () => {
        try {
            if (!currentDocument) return;
            const pdfContainer = document.getElementById("pdf-container");

            if (!pdfContainer) {
                toast.error("PDF container not found");
                return;
            }

            const width = pdfContainer.clientWidth;
            const height = pdfContainer.clientHeight;

            // Save percentage instead of pixels
            const signatureElement = document.getElementById("draggable-signature");

            if (!signatureElement) {
                toast.error("Signature element not found");
                return;
            }

            const containerRect = pdfContainer.getBoundingClientRect();
            const signatureRect = signatureElement.getBoundingClientRect();

            const x =signatureRect.left - containerRect.left + signatureRect.width / 2;

            const y = signatureRect.top - containerRect.top + signatureRect.height / 2;

            const xPercent = (x / containerRect.width) * 100;
            const yPercent = (y / containerRect.height) * 100;

            console.log("Container Width:", width);
            console.log("Container Height:", height);
            console.log("Signature Position:", signaturePosition);
            console.log("X %:", xPercent);
            console.log("Y %:", yPercent);

            const response= await saveSignature({documentId: currentDocument._id, page: 1, x: xPercent, y: yPercent });
            setSignatures((prev) => [response.signature]);
            toast.success("Signature position saved");
        } catch (error) {
            console.error("Save Signature Error:", error);
            toast.error("Failed to save position");
        }
    };

    // Updates the current signature position.
    const handleDragEnd = (event: DragEndEvent) => {
        const {delta} = event;
        setSignaturePosition((prev) => ({
            x: prev.x + delta.x,
            y: prev.y + delta.y,
        }));
    };

    const handleFinalizeSignature = async () => {
        try {
            if (!currentDocument) return;
            await finalizeSignature(currentDocument._id);
            toast.success("Signed PDF generated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        }
    };

    if (loading) {
        return (
            <div className="p-10">
                Loading document...
            </div>
        );
    }

    if (!currentDocument) {
        return (
            <div className="p-10">
                Document not found.
            </div>
        );
    }

    const pdfUrl= `http://localhost:5000${currentDocument.filePath}`

    return (
        <main className='p-10'>
            <h1 className='text-2xl font-bold mb-6'>{currentDocument.title}</h1>
            <DndContext onDragEnd={handleDragEnd}>
                <div id="pdf-container" className='relative inline-block'>
                    <PdfViewer fileUrl={pdfUrl} />
                    <DraggableSignature id='signature' x={signaturePosition.x} y={signaturePosition.y} />
                    {
                        signatures.map(signature => (
                            <SignaturePlaceholder key={signature._id} x={signature.x} y={signature.y} />
                        ))
                    }
                </div>
            </DndContext>

            <button onClick={saveSignaturePosition} className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md'>
                Save Signature Position
            </button>
            <button onClick={handleFinalizeSignature} className="ml-4 px-5 py-2 bg-green-600 text-white rounded-md">
                Generate Signed PDF
            </button>
        </main>
    )
}

export default DocumentPage
