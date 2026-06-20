"use client"
import Link from 'next/link'
import type { Document } from '@/types/document.types'
import StatusBadge from '@/components/ui/StatusBadge'
import { ArrowRight, CalendarDays, CheckCircle, ExternalLink, FileText } from 'lucide-react'

interface Props {
    document: Document
}

// Reusable document card used in dashboard document listing.
const DocumentCard = ({ document }: Props) => {
    const uploadedAt = document.createdAt
        ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(document.createdAt))
        : "Recently";

    return (
        <article className='group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'>
            <div className='flex items-start justify-between gap-3'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white'>
                    <FileText className='h-5 w-5' />
                </div>
                <StatusBadge status={document.status} />
            </div>

            <div className='mt-5 flex-1'>
                <h2 className='line-clamp-2 text-lg font-semibold text-slate-950'>{document.title}</h2>
                <p className='mt-3 flex items-center gap-2 text-sm text-slate-500'>
                    <CalendarDays className='h-4 w-4' />
                    Uploaded {uploadedAt}
                </p>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-3">
                <Link href={`/documents/${document._id}`} className="inline-flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
                    View Document
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>

                {document.status === "Signed" && document.signedFilePath && (
                    <Link href={document.signedFilePath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-between rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            View Signed PDF
                        </span>
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                )}
            </div>
        </article>
    )
}

export default DocumentCard
