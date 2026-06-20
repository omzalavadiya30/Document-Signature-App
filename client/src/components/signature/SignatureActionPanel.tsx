"use client"
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { acceptSignatureInvite, rejectSignatureInvite } from '@/services/signature.service'
import type { SignatureStatus } from '@/types/signature.types'

const getRequestErrorMessage = (error: unknown, fallback: string) => {
    const requestError = error as { response?: { data?: { message?: string } } }
    return requestError.response?.data?.message || fallback
}

interface SignatureActionPanelProps {
    token: string
    status: SignatureStatus["status"]
    rejectionReason?: string | null
    onStatusChange?: (status: SignatureStatus) => void
}

interface RejectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (reason: string) => void
    isLoading: boolean
}

const RejectionReasonModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [reason, setReason] = useState('')

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }
        onSubmit(reason)
        setReason('')
    }

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/60 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="rejection-reason-title"
                className="pointer-events-auto w-full max-w-md rounded-lg bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 id="rejection-reason-title" className="text-lg font-bold text-slate-950">Rejection Reason</h2>
                </div>

                <div className="p-6">
                    <p className="mb-4 text-sm text-slate-600">Please provide a reason for rejecting this signature request.</p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={5}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-600/15"
                    />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                    >
                        {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        Reject
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

const SignatureActionPanel: React.FC<SignatureActionPanelProps> = ({ token, status, rejectionReason, onStatusChange }) => {
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleAccept = async () => {
        try {
            setIsLoading(true)
            const data = await acceptSignatureInvite(token)
            toast.success('Signature invitation accepted!')
            onStatusChange?.({ success: true, status: data.signature.status })
        } catch (error: unknown) {
            console.error('Error accepting signature:', error)
            toast.error(getRequestErrorMessage(error, 'Failed to accept signature invitation'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleRejectSubmit = async (reason: string) => {
        try {
            setIsLoading(true)
            const data = await rejectSignatureInvite(token, reason)
            toast.success('Signature invitation rejected!')
            setIsRejectionModalOpen(false)
            onStatusChange?.({
                success: true,
                status: data.signature.status,
                rejectionReason: data.signature.rejectionReason,
                rejectedAt: data.signature.rejectedAt
            })
        } catch (error: unknown) {
            console.error('Error rejecting signature:', error)
            toast.error(getRequestErrorMessage(error, 'Failed to reject signature invitation'))
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "Signed") {
        return (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                        <h3 className="font-semibold text-emerald-900">Signature Completed</h3>
                        <p className="mt-1 text-sm text-emerald-700">
                            This signature request has already been signed.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === "Rejected") {
        return (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <div>
                        <h3 className="font-semibold text-rose-900">Signature Rejected</h3>
                        <p className="mt-1 text-sm text-rose-700">
                            {rejectionReason || "This signature request was rejected."}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-950">Signature Required</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            This document requires your digital signature. Would you like to proceed?
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Accept
                    </button>
                    <button
                        onClick={() => setIsRejectionModalOpen(true)}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <X className="w-4 h-4" />
                        )}
                        Reject
                    </button>
                </div>
            </div>

            <RejectionReasonModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onSubmit={handleRejectSubmit}
                isLoading={isLoading}
            />
        </>
    )
}

export default SignatureActionPanel
