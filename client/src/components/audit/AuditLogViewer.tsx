"use client"
import React, { useEffect, useState } from 'react'
import { getDocumentAudit } from '@/services/audit.service'
import { format } from 'date-fns'
import { Clock, User, MapPin, Zap, ChevronDown, ChevronUp, PenTool, Mail, Download, AlertCircle, Eye, X } from 'lucide-react'

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

    useEffect(() => {
        if (isOpen && documentId) {
            loadAuditLogs()
        }
    }, [isOpen, documentId, skip])

    const loadAuditLogs = async () => {
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
        } catch (err: any) {
            console.error('Error loading audit logs:', err)
            setError(err.response?.data?.message || 'Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Audit Trail</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Document activity log ({total} total entries)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        <X />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-gray-600">Loading audit logs...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {!loading && !error && logs.length === 0 && (
                        <div className="m-4 p-8 text-center text-gray-600">
                            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>No audit logs found</p>
                        </div>
                    )}

                    {!loading && logs.length > 0 && (
                        <div className="p-4 space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log._id}
                                    className="border rounded-lg overflow-hidden hover:shadow-md transition"
                                >
                                    <button
                                        onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                                        className="w-full p-4 text-left hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                {getActionIcon(log.action)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {log.userName || log.userEmail}
                                                        </span>
                                                        {log.status === 'FAILED' && (
                                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                                                                FAILED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
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
                                            <div className="text-gray-400">
                                                {expandedId === log._id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {expandedId === log._id && (
                                        <div className="border-t bg-gray-50 p-4">
                                            {log.details && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">Details:</p>
                                                    <p className="text-sm text-gray-600">{log.details}</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <p className="font-semibold text-gray-700">Email:</p>
                                                    <p className="text-gray-600 break-all">{log.userEmail}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">IP Address:</p>
                                                    <p className="text-gray-600">{log.ipAddress}</p>
                                                </div>
                                            </div>
                                            {log.userAgent && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">User Agent:</p>
                                                    <p className="text-xs text-gray-600 break-all font-mono bg-white p-2 rounded border border-gray-200">
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

                {/* Footer with pagination */}
                {!loading && logs.length > 0 && (
                    <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSkip(Math.max(0, skip - limit))}
                                disabled={skip === 0}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setSkip(skip + limit)}
                                disabled={skip + limit >= total}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
