"use client"
import Link from 'next/link'
import { Document } from '@/types/document.types'

interface Props {
    document: Document
}

// Reusable document card used in dashboard document listing.
const DocumentCard = ({ document }: Props) => {
    return (
        <div className='bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition'>
            <h2 className='font-semibold text-lg'>{document.title}</h2>
            <p className='text-gray-500 text-sm mt-1'>Status: <span className='ml-1 font-medium'>{document.status}</span></p>

            <Link href={`/documents/${document._id}`} className='text-blue-600 mt-4 hover:underline inline-block'>View Document</Link>
        </div>
    )
}

export default DocumentCard
