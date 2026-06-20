"use client"
import { getPublicDocument, getSignatureStatus } from '@/services/signature.service';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, FileText, Home, Mail, ShieldCheck } from 'lucide-react';
import SignatureActionPanel from '@/components/signature/SignatureActionPanel';
import type { SignatureStatus } from '@/types/signature.types';
import StatusBadge from '@/components/ui/StatusBadge';

const PdfViewer = dynamic(() => import('@/components/documents/PdfViewer'), { ssr: false });

interface Document {
    _id: string;
    title: string;
    filePath: string;
    fileName: string;
    signedFileName?: string;
    signedFilePath?: string;
    status: SignatureStatus["status"];
}

const PublicSignPage = () => {
    const { token } = useParams()
    const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
    const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if(!token) return;

        const loadDocument = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getPublicDocument(token as string);

                if (response.success) {
                    setCurrentDocument(response.document);
                    const statusResponse = await getSignatureStatus(token as string);
                    setSignatureStatus(statusResponse);
                } else {
                    setError(response.message || "Failed to load document");
                }
            } catch (err: unknown) {
                const requestError = err as { response?: { data?: { message?: string } } }
                console.error("Error loading document:", err);
                setError(requestError.response?.data?.message || "Failed to load document. The link may be invalid or expired.");
            } finally {
                setLoading(false);
            }
        };

        void loadDocument();
    }, [token])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                    <p className="text-sm font-medium text-slate-600">Loading document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-12 w-12 text-rose-600" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-slate-950">Unable to Load Document</h1>
                    <p className="mb-6 text-sm text-slate-600">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        <Home className="h-4 w-4" />
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    if (!currentDocument) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <p className="text-sm font-medium text-slate-600">Document not found</p>
            </div>
        );
    }

    // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    // const pdfUrl = `${apiUrl}${currentDocument.filePath}`;
    const pdfUrl = currentDocument.filePath;
    const effectiveStatus = signatureStatus?.status || currentDocument.status;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                                <ShieldCheck className="h-4 w-4" />
                                Secure signing request
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                    {currentDocument.title}
                                </h1>
                                <StatusBadge status={effectiveStatus} size="md" />
                            </div>
                        </div>
                        <p className="flex items-center gap-2 text-sm text-slate-600">
                        {effectiveStatus === "Signed" ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <span>Document Already Signed</span>
                            </>
                        ) : effectiveStatus === "Rejected" ? (
                            <>
                                <AlertTriangle className="h-5 w-5 text-rose-600" />
                                <span>Signature Request Rejected</span>
                            </>
                        ) : (
                            <>
                                <FileText className="h-5 w-5 text-teal-700" />
                                <span>Signature Request - Please Sign Below</span>
                            </>
                        )}
                        </p>
                    </div>
                </div>
            </header>

            <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-950">
                        <FileText className="h-5 w-5 text-teal-700" />
                        Document Preview
                    </h2>
                    <PdfViewer fileUrl={pdfUrl} />
                </div>

                <aside className="h-fit space-y-4 lg:sticky lg:top-6">
                    {signatureStatus && (
                        <SignatureActionPanel
                            token={token as string}
                            status={signatureStatus.status}
                            rejectionReason={signatureStatus.rejectionReason}
                            onStatusChange={(nextStatus) => {
                                setSignatureStatus((previousStatus) => ({
                                    success: true,
                                    status: nextStatus.status,
                                    inviteStatus: nextStatus.inviteStatus || previousStatus?.inviteStatus,
                                    rejectionReason: nextStatus.rejectionReason ?? previousStatus?.rejectionReason,
                                    signedAt: nextStatus.signedAt ?? previousStatus?.signedAt,
                                    rejectedAt: nextStatus.rejectedAt ?? previousStatus?.rejectedAt
                                }));
                                setCurrentDocument((document) => document ? { ...document, status: nextStatus.status } : document);
                            }}
                        />
                    )}

                    {effectiveStatus === "Signed" && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-700" />
                            <p className="text-sm font-semibold text-emerald-700">This document has been signed</p>
                        </div>
                    )}

                    {effectiveStatus === "Rejected" && (
                        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4">
                            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                            <p className="text-sm text-rose-700">
                                Reason: {signatureStatus?.rejectionReason || "No reason provided."}
                            </p>
                        </div>
                    )}
                </aside>
            </section>
        </main>
    )
}

export default PublicSignPage
