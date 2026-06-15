"use client"
import { getDocument } from '@/services/document.service';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { getSignatures, saveSignature } from '@/services/signature.service';
import SignatureOverlay from '@/components/signature/SignatureOverlay';
import { Signature } from '@/types/signature.types';
import SignaturePlaceholder from '@/components/signature/SignaturePlaceholder';
import { Document } from '@/types/document.types';

const PdfViewer= dynamic(() => import("@/components/documents/PdfViewer"), { ssr: false })

// Document Details. Page Displays single document and PDF preview.
const DocumentPage = () => {
    const { id }= useParams();

    const [document, setDocument]= useState<Document | null>(null)
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [loading, setLoading]= useState(true);
    const [signaturesLoading, setSignaturesLoading]= useState(true);

    useEffect(() => {
        if(!id) return
        const initializePage = async () => {
            await Promise.all([loadDocument(), loadSignatures()]);
        };

        void initializePage();
    }, [id]);

    // fetch documents
    const loadDocument= async() => {
        try {
            const data= await getDocument(id as string);
            setDocument(data.document)
        } catch(err) {
            console.error("Load Document Error: ", err);
            toast.error("Failed to load Document")
        } finally {
            setLoading(false)
        }
    }

    const loadSignatures = async () => {
        try {
            const data = await getSignatures(id as string);
            setSignatures(data.signatures);
        } catch (error) {
            console.error("Load Signatures Error:",error);
        } finally {
            setSignaturesLoading(false)
        }
    };

    const handleSaveSignature= async(x: number, y: number) => {
        try {
            if(!document) return;
            const response= await saveSignature({ documentId: document._id, page: 1, x, y });
            setSignatures(prev => [...prev, response.signature]) // Update UI immediately without refetching
            toast.success("Signature position saved")
        } catch(err) {
            console.error("Signature Position Error: ", err);
            toast.error("Failed to save Signature")
        }
    }

    if (loading) {
        return (
        <div className="p-10">
            Loading document...
        </div>
        );
    }

    if (!document) {
        return (
            <div className="p-10">
                Document not found.
            </div>
        );
    }

    const pdfUrl= `http://localhost:5000${document.filePath}`
    return (
        <main className='p-10'>
            <h1 className='text-2xl font-bold mb-6'>{document.title}</h1>
            <div className='relative inline-block'>
                <PdfViewer fileUrl={pdfUrl} />
                <SignatureOverlay onSave={handleSaveSignature} />
                {
                    signatures.map(signature => (
                        <SignaturePlaceholder key={signature._id} x={signature.x} y={signature.y} />
                    ))
                }
            </div>
        </main>
    )
}

export default DocumentPage
