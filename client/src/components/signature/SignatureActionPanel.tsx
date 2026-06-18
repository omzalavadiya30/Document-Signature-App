"use client"
import React, { useState } from 'react'
import { AlertCircle, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { acceptSignatureInvite, rejectSignatureInvite } from '@/services/signature.service'
import { SignatureStatus } from '@/types/signature.types'

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Rejection Reason</h2>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4">Please provide a reason for rejecting this signature request.</p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="border-t px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        Reject
                    </button>
                </div>
            </div>
        </div>
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="font-semibold text-green-900">Signature Completed</h3>
                        <p className="text-sm text-green-700 mt-1">
                            This signature request has already been signed.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === "Rejected") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900">Signature Rejected</h3>
                        <p className="text-sm text-red-700 mt-1">
                            {rejectionReason || "This signature request was rejected."}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900">Signature Required</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            This document requires your digital signature. Would you like to proceed?
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
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
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
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
