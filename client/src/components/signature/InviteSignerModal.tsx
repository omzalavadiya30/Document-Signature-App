"use client"
import React, { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader, X } from 'lucide-react'
import { inviteSigner } from '@/services/signature.service';

interface InviteSignerModalProps {
    documentId: string;
    documentTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const getRequestErrorMessage = (error: unknown) => {
    const requestError = error as { response?: { data?: { message?: string } } }
    return requestError.response?.data?.message || 'Failed to send invitation. Please try again.';
};

const InviteSignerModal: React.FC<InviteSignerModalProps> = ({ 
    documentId, 
    documentTitle, 
    isOpen, 
    onClose,
    onSuccess 
}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await inviteSigner(documentId, email);

            if (response.success) {
                setSuccess(true);
                setEmail('');
                // Reset after 2 seconds and close
                setTimeout(() => {
                    onClose();
                    onSuccess?.();
                }, 2000);
            } else {
                setError(response.message || 'Failed to send invitation');
            }
        } catch (err: unknown) {
            console.error('Error inviting signer:', err);
            setError(getRequestErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">Invite Signer</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Send {documentTitle} for signature
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                            aria-label="Close invite signer modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-3">
                                <CheckCircle className="h-12 w-12 text-emerald-600" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-emerald-700">
                                Invitation Sent!
                            </h3>
                            <p className="text-sm text-slate-600">
                                The signer will receive an email with a link to sign the document.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Signer Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null); // Clear error when user types
                                    }}
                                    placeholder="signer@example.com"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                                    <p className="text-sm text-rose-700">{error}</p>
                                </div>
                            )}

                            <div className="mb-4 flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                                <p className="text-sm text-teal-800">
                                    An email with a unique signature link will be sent to the signer. The link will expire in 7 days.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-4 w-4" />
                                            Send Invite
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InviteSignerModal
