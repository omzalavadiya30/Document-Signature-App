"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { getDocumentAudit } from '@/services/audit.service'
import { format } from 'date-fns'
import { AlertCircle, ChevronDown, ChevronUp, Clock, Download, Eye, Mail, MapPin, PenTool, X } from 'lucide-react'

interface AuditLog {
    _id: string
    documentId: string
    userId?: string
    userEmail: string
    userName?: string
    action: string
    ipAddress: string
    userAgent: string
    timestamp: string
    details?: string
    status: string
}

interface AuditLogViewerProps {
    documentId: string
    isOpen: boolean
    onClose: () => void
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ documentId, isOpen, onClose }) => {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [skip, setSkip] = useState(0)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const loadAuditLogs = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getDocumentAudit(documentId, skip, limit)
            if (response.success) {
                setLogs(response.logs)
                setTotal(response.pagination.total)
            } else {
                setError(response.message || 'Failed to load audit logs')
            }
        } catch (err: unknown) {
            const requestError = err as { response?: { data?: { message?: string } } }
            console.error('Error loading audit logs:', err)
            setError(requestError.response?.data?.message || 'Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }, [documentId, limit, skip])

    useEffect(() => {
        if (isOpen && documentId) {
            const timeoutId = window.setTimeout(() => {
                void loadAuditLogs()
            }, 0)

            return () => window.clearTimeout(timeoutId)
        }
    }, [isOpen, documentId, loadAuditLogs])

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATED':
                return 'bg-blue-100 text-blue-800'
            case 'SIGNED':
                return 'bg-green-100 text-green-800'
            case 'VIEWED':
                return 'bg-gray-100 text-gray-800'
            case 'DOWNLOADED':
                return 'bg-purple-100 text-purple-800'
            case 'SHARED':
                return 'bg-yellow-100 text-yellow-800'
            case 'REJECTED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'SIGNED':
                return <PenTool className="w-5 h-5 text-green-600" />
            case 'SHARED':
                return <Mail className="w-5 h-5 text-yellow-600" />
            case 'DOWNLOADED':
                return <Download className="w-5 h-5 text-purple-600" />
            case 'REJECTED':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            case 'CREATED':
                return <Eye className="w-5 h-5 text-blue-600" />
            default:
                return <Eye className="w-5 h-5 text-gray-600" />
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Audit Trail</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Document activity log ({total} total entries)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                        aria-label="Close audit trail"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                                <p className="text-sm text-slate-600">Loading audit logs...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                            <p className="text-sm text-rose-700">{error}</p>
                        </div>
                    )}

                    {!loading && !error && logs.length === 0 && (
                        <div className="m-4 p-8 text-center text-slate-600">
                            <Clock className="mx-auto mb-2 h-12 w-12 text-slate-400" />
                            <p>No audit logs found</p>
                        </div>
                    )}

                    {!loading && logs.length > 0 && (
                        <div className="p-4 space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log._id}
                                    className="overflow-hidden rounded-lg border border-slate-200 transition hover:shadow-sm"
                                >
                                    <button
                                        onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                                        className="w-full p-4 text-left transition hover:bg-slate-50"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                {getActionIcon(log.action)}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="break-all text-sm font-medium text-slate-950">
                                                            {log.userName || log.userEmail}
                                                        </span>
                                                        {log.status === 'FAILED' && (
                                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                                                                FAILED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {log.ipAddress}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-slate-400">
                                                {expandedId === log._id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {expandedId === log._id && (
                                        <div className="border-t border-slate-200 bg-slate-50 p-4">
                                            {log.details && (
                                                <div className="mb-3">
                                                    <p className="mb-1 text-xs font-semibold text-slate-700">Details:</p>
                                                    <p className="text-sm text-slate-600">{log.details}</p>
                                                </div>
                                            )}
                                            <div className="grid gap-3 text-xs sm:grid-cols-2">
                                                <div>
                                                    <p className="font-semibold text-slate-700">Email:</p>
                                                    <p className="break-all text-slate-600">{log.userEmail}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">IP Address:</p>
                                                    <p className="text-slate-600">{log.ipAddress}</p>
                                                </div>
                                            </div>
                                            {log.userAgent && (
                                                <div className="mt-3">
                                                    <p className="mb-1 text-xs font-semibold text-slate-700">User Agent:</p>
                                                    <p className="break-all rounded border border-slate-200 bg-white p-2 font-mono text-xs text-slate-600">
                                                        {log.userAgent}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!loading && logs.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-sm text-slate-600">
                            Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSkip(Math.max(0, skip - limit))}
                                disabled={skip === 0}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setSkip(skip + limit)}
                                disabled={skip + limit >= total}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuditLogViewer
