"use client"
import DocumentCard from "@/components/documents/DocumentCard";
import { getDocuments } from "@/services/document.service";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Document } from "@/types/document.types";

const DashboardPage = () => {
    const router= useRouter();
    const [documents, setDocuments] = useState<Document[]>([]) // Stores documents fetched from the backend API
    const [loading, setLoading]= useState(false)

    // Prevent unauthenticated users from accessing dashboard.
    // If JWT does not exist, redirect user to login page.
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        void loadDocuments();
    }, [router]);

    // fetch documents
    const loadDocuments= async() => {
        try {
            setLoading(true)
            const data= await getDocuments();
            setDocuments(data.documents)
        } catch(err) {
            console.error("Load Documents Error: ", err);
            toast.error("Failed to load Documents")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
        <div className="p-10">
            Loading documents...
        </div>
        );
    }

    return (
        <main className="p-10">
            <h1 className="text-3xl font-bold mb-8">My Documents</h1>
            {
                documents?.length === 0 ? (
                    <p>No Documents Upload Yet</p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-5">
                        {
                            documents.map(document => (
                                <DocumentCard key={document._id} document={document} />
                            ))
                        }
                    </div>
                )
            }
        </main>
    )
}

export default DashboardPage
