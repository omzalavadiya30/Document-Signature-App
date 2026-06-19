"use client"
import DocumentCard from "@/components/documents/DocumentCard";
import { getDocuments } from "@/services/document.service";
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { Document } from "@/types/document.types";
import { CheckCircle2, Clock3, FileText, LayoutGrid, ListFilter, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type StatusFilter = "All" | Document["status"];

const statusOptions: { label: StatusFilter; icon: LucideIcon }[] = [
    { label: "All", icon: LayoutGrid },
    { label: "Pending", icon: Clock3 },
    { label: "Signed", icon: CheckCircle2 },
    { label: "Rejected", icon: XCircle }
];

interface UserInfo {
    name: string;
    email: string;
}

const DashboardPage = () => {
    const router= useRouter();
    const [documents, setDocuments] = useState<Document[]>([]) // Stores documents fetched from the backend API
    const [loading, setLoading]= useState(false)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
    const [user, setUser] = useState<UserInfo | null>(null) // Logged in User

    const loadDocuments = useCallback(async() => {
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
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.success("Logged out successfully");

        router.push("/login");
    };

    // Prevent unauthenticated users from accessing dashboard.
    // If JWT does not exist, redirect user to login page.
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const storedUser = localStorage.getItem("user");
        try {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Invalid user data in localStorage", error);
            localStorage.removeItem("user");
        }

        void loadDocuments();
    }, [loadDocuments, router]);

    const statusCounts = useMemo(() => ({
        All: documents.length,
        Pending: documents.filter((document) => document.status === "Pending").length,
        Signed: documents.filter((document) => document.status === "Signed").length,
        Rejected: documents.filter((document) => document.status === "Rejected").length
    }), [documents]);

    const filteredDocuments = useMemo(() => (
        statusFilter === "All"
            ? documents
            : documents.filter((document) => document.status === statusFilter)
    ), [documents, statusFilter]);

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                            <ShieldCheck className="h-4 w-4" />
                            SignFlow workspace
                        </div>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">My Documents</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                            Track signature progress, review pending requests, and open signed files from one responsive dashboard.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        {/* User Profile */}
                        <div className="flex items-center gap-3">

                            {/* Avatar */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-blue-600 text-white font-bold shadow-md">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>

                            {/* User Info */}
                            <div className="text-right">
                                <p className="font-semibold text-slate-900">
                                    {user?.name || "User"}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <Link href="/documents/upload" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                                Upload PDF
                            </Link>
                            <button onClick={() => void loadDocuments()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>

                            <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{statusCounts.Pending}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Signed</p>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{statusCounts.Signed}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Rejected</p>
                        <p className="mt-2 text-3xl font-bold text-rose-600">{statusCounts.Rejected}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <ListFilter className="h-4 w-4" />
                            Filter by signature status
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            {statusOptions.map((option) => {
                                const Icon = option.icon;
                                const isActive = statusFilter === option.label;

                                return (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => setStatusFilter(option.label)}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                            isActive
                                                ? "border-slate-900 bg-slate-900 text-white"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {option.label}
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
                                            {statusCounts[option.label]}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-52 animate-pulse rounded-lg border border-slate-200 bg-white" />
                        ))}
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-slate-950">
                            {documents.length === 0 ? "No documents uploaded yet" : `No ${statusFilter.toLowerCase()} documents`}
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            {documents.length === 0
                                ? "Uploaded documents will appear here with clear signing status and quick actions."
                                : "Try another status filter to continue reviewing your signature queue."}
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredDocuments.map(document => (
                            <DocumentCard key={document._id} document={document} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default DashboardPage
