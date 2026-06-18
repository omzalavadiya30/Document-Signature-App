"use client"
import { getPublicDocument } from '@/services/signature.service';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileText, CheckCircle, Mail, Home } from 'lucide-react';

const PdfViewer = dynamic(() => import('@/components/documents/PdfViewer'), { ssr: false });

interface Document {
    _id: string;
    title: string;
    filePath: string;
    fileName: string;
    signedFileName?: string;
    signedFilePath?: string;
    status: string;
}

const PublicSignPage = () => {
    const { token } = useParams()
    const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if(!token) return;
        loadDocument();
    }, [token])

    const loadDocument = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getPublicDocument(token as string);
            
            if (response.success) {
                setCurrentDocument(response.document);
            } else {
                setError(response.message || "Failed to load document");
            }
        } catch (err: any) {
            console.error("Error loading document:", err);
            setError(err.response?.data?.message || "Failed to load document. The link may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Document</h1>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2 justify-center"
                    >
                        <Home className="w-4 h-4" />
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    if (!currentDocument) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Document not found</p>
            </div>
        );
    }

    const pdfUrl = `http://localhost:5000${currentDocument.filePath}`;

    return (
        <div className="w-full bg-gray-100 min-h-screen">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {currentDocument.title}
                    </h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                        {currentDocument.status === "Signed" ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span>Document Already Signed</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span>Signature Request - Please Sign Below</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Document Preview
                    </h2>
                    <PdfViewer fileUrl={pdfUrl} />
                    
                    {currentDocument.status === "Signed" && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-700 shrink-0" />
                            <p className="text-green-700 font-semibold">This document has been signed</p>
                        </div>
                    )}
                    
                    {currentDocument.status !== "Signed" && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                            <Mail className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                            <p className="text-blue-700">
                                Signature interface coming soon. Document owner can review and finalize signatures.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PublicSignPage
