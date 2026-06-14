"use client"
import { getDocument } from '@/services/document.service';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const PdfViewer= dynamic(() => import("@/components/documents/PdfViewer"), { ssr: false })

// Document Details. Page Displays single document and PDF preview.
const DocumentPage = () => {
    const { id }= useParams();

    const [document, setDocument]= useState<any>(null)
    const [loading, setLoading]= useState(true);

    useEffect(() => {
        void loadDocument();
    }, [])

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

    if (loading) {
        return (
        <div className="p-10">
            Loading document...
        </div>
        );
    }

    const pdfUrl= `http://localhost:5000${document.filePath}`
    console.log('pdfUrl', pdfUrl)
    return (
        <main className='p-10'>
            <h1 className='text-2xl font-bold mb-6'>{document.title}</h1>

            <PdfViewer fileUrl={pdfUrl} />
        </main>
    )
}

export default DocumentPage
