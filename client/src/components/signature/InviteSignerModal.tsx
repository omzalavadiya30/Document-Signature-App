"use client"
import React, { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { inviteSigner } from '@/services/signature.service';

interface InviteSignerModalProps {
    documentId: string;
    documentTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

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
        } catch (err: any) {
            console.error('Error inviting signer:', err);
            setError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">Invite Signer</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Send "{documentTitle}" for signature
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-3">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-green-600 mb-2">
                                Invitation Sent!
                            </h3>
                            <p className="text-gray-600">
                                The signer will receive an email with a link to sign the document.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    disabled={loading}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                                <Mail className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700">
                                    An email with a unique signature link will be sent to the signer. The link will expire in 7 days.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4" />
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
