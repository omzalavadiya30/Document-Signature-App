"use client"
import { getDocument } from '@/services/document.service';
import { useParams } from 'next/navigation'
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { finalizeSignature, getSignatures, saveSignature } from '@/services/signature.service';
import type { Signature } from '@/types/signature.types';
import SignaturePlaceholder from '@/components/signature/SignaturePlaceholder';
import type { Document } from '@/types/document.types';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import DraggableSignature from '@/components/signature/DraggableSignature';
import InviteSignerModal from '@/components/signature/InviteSignerModal';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowLeft, CheckCircle, Clock, FileText, Mail, Save, ShieldCheck } from 'lucide-react';

const PdfViewer= dynamic(() => import("@/components/documents/PdfViewer"), { ssr: false })

// Document Details. Page Displays single document and PDF preview.
const DocumentPage = () => {
    const { id }= useParams();

    const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [loading, setLoading]= useState(true);
    const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 100})
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    const loadDocument = useCallback(async() => {
        try {
            const data= await getDocument(id as string);
            setCurrentDocument(data.document)
        } catch(err) {
            console.error("Load Document Error: ", err);
            toast.error("Failed to load Document")
        } finally {
            setLoading(false)
        }
    }, [id])

    const loadSignatures = useCallback(async () => {
        try {
            const data = await getSignatures(id as string);
            setSignatures(data.signatures);
        } catch (error) {
            console.error("Load Signatures Error:",error);
        }
    }, [id]);

    useEffect(() => {
        if(!id) return
        const initializePage = async () => {
            await Promise.all([loadDocument(), loadSignatures()]);
        };

        void initializePage();
    }, [id, loadDocument, loadSignatures]);
    
    // Stores draggable coordinates in MongoDB.
    const saveSignaturePosition = async () => {
        try {
            if (!currentDocument) return;
            const pdfContainer = document.getElementById("pdf-container");

            if (!pdfContainer) {
                toast.error("PDF container not found");
                return;
            }

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

            const response= await saveSignature({documentId: currentDocument._id, page: 1, x: xPercent, y: yPercent });
            setSignatures([response.signature]);
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
            setCurrentDocument({ ...currentDocument, status: "Signed" });
            toast.success("Signed PDF generated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                    <p className="text-sm font-medium text-slate-600">Loading document...</p>
                </div>
            </div>
        );
    }

    if (!currentDocument) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <FileText className="mx-auto h-10 w-10 text-slate-400" />
                    <h1 className="mt-4 text-xl font-semibold text-slate-950">Document not found</h1>
                    <p className="mt-2 text-sm text-slate-500">This document may have been removed or the link is no longer valid.</p>
                    <Link href="/dashboard" className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const pdfUrl= `${apiUrl}${currentDocument.filePath}`

    return (
        <>
            <main className='min-h-screen bg-slate-50 text-slate-950'>
                <header className='border-b border-slate-200 bg-white'>
                    <div className='mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'>
                        <div>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <div className='mt-3 flex flex-wrap items-center gap-3'>
                                <h1 className='text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl'>{currentDocument.title}</h1>
                                <StatusBadge status={currentDocument.status} size="md" />
                            </div>
                            <p className='mt-2 flex items-center gap-2 text-sm text-slate-500'>
                                <ShieldCheck className='h-4 w-4 text-teal-700' />
                                Manage placement, signer invitations, and audit history.
                            </p>
                        </div>
                        <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end'>
                        <button 
                            onClick={() => setIsAuditModalOpen(true)}
                            className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50'
                        >
                            <Clock className='w-4 h-4' />
                            View Audit Trail
                        </button>
                        <button 
                            onClick={() => setIsInviteModalOpen(true)}
                            className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700'
                        >
                            <Mail className='w-4 h-4' />
                            Invite Signer
                        </button>
                        </div>
                    </div>
                </header>

                <section className='mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8'>
                    <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4'>
                        <DndContext onDragEnd={handleDragEnd}>
                            <div id="pdf-container" className='relative mx-auto w-full max-w-[900px] overflow-x-auto rounded-lg border border-slate-200 bg-white'>
                                <PdfViewer fileUrl={pdfUrl} />
                                <DraggableSignature id='signature' x={signaturePosition.x} y={signaturePosition.y} />
                                {signatures.map(signature => (
                                    <SignaturePlaceholder key={signature._id} x={signature.x} y={signature.y} />
                                ))}
                            </div>
                        </DndContext>
                    </div>

                    <aside className='h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6'>
                        <h2 className='text-base font-semibold text-slate-950'>Signature actions</h2>
                        <p className='mt-2 text-sm text-slate-500'>Place the signature marker, save the position, then finalize the signed PDF when ready.</p>
                        <div className='mt-5 space-y-3'>
                            <button onClick={saveSignaturePosition} className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800'>
                                <Save className='w-4 h-4' />
                                Save position
                            </button>
                            <button onClick={handleFinalizeSignature} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                                <CheckCircle className='w-4 h-4' />
                                Generate signed PDF
                            </button>
                        </div>
                    </aside>
                </section>

            <AuditLogViewer
                documentId={currentDocument._id}
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
            />
            </main>

            <InviteSignerModal
                documentId={currentDocument._id}
                documentTitle={currentDocument.title}
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={loadDocument}
            />
        </>
    )
}

export default DocumentPage
