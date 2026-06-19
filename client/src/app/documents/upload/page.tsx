"use client";

import { uploadDocument } from "@/services/document.service";
import {
    ArrowLeft,
    Check,
    FileText,
    ShieldCheck,
    UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import toast from "react-hot-toast";

const UploadDocumentPage = () => {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile =
            event.target.files?.[0] || null;

        if (selectedFile && selectedFile.type !== "application/pdf") {
            toast.error("Only PDF files allowed");
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!title.trim()) {
            return toast.error("Document title is required");
        }

        if (!file) {
            return toast.error("Please select a PDF file");
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("document", file);
            await uploadDocument(formData);
            toast.success("Document uploaded successfully");

            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload document");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-5xl px-6 py-5">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="mt-4">
                        <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                            <ShieldCheck className="h-4 w-4" />
                            SignFlow Workspace
                        </div>
                        <h1 className="mt-2 text-4xl font-bold">
                            Upload Document
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Upload a PDF and start your signature workflow.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-5xl px-6 py-10">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Upload Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            {/* Drop Zone */}
                            <label htmlFor="pdf-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 transition hover:border-blue-500 hover:bg-blue-50">
                                <UploadCloud className="h-14 w-14 text-blue-600" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    Drag & Drop PDF
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    or click to browse
                                </p>
                                <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                            </label>

                            {/* Selected File */}
                            {file && (
                                <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-4">
                                    <FileText className="h-6 w-6 text-emerald-600" />
                                    <div>
                                        <p className="font-medium">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-semibold">
                                    Document Title
                                </label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="NDA Agreement" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" />
                            </div>

                            {/* Button */}
                            <button type="submit" disabled={loading} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
                                <UploadCloud className="h-5 w-5" />
                                {loading ? "Uploading..." : "Upload Document"}
                            </button>
                        </form>
                    </div>

                    {/* Side Panel */}
                    <div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                    <Check className="h-5 w-5 text-emerald-600" />
                                </div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    Quick Tips
                                </h2>
                            </div>

                            <ul className="mt-6 space-y-4">
                                {["Upload PDF files only", "Place signatures anywhere on document", "Generate final signed PDF instantly",
                                    "Share public signing links with others", "Track signature status from dashboard"].map((tip) => (
                                    <li key={tip} className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition">
                                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">
                                            {tip}
                                        </span>
                                    </li>
                                ))}

                            </ul>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default UploadDocumentPage;