"use client";

import { forgotPassword } from "@/services/auth.service";
import { ArrowLeft, Mail, ShieldCheck, CheckCircle2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            return toast.error("Please enter your email");
        }

        try {
            setLoading(true);

            const response = await forgotPassword(email);
            toast.success(response.message);
            setSuccess(true);
        } catch (error: any) {
            toast.error(error?.response?.data?.message ||"Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-slate-200">
                        <ShieldCheck className="h-5 w-5 text-teal-600" />
                        <span className="font-semibold text-slate-800">
                            SignFlow
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-lg shadow-xl p-8">
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                                    <LockKeyhole className="h-10 w-10 text-blue-600" />
                                </div>
                                <h1 className="mt-6 text-4xl font-bold text-slate-900">
                                    Forgot Password
                                </h1>
                                <p className="mt-3 text-slate-600">
                                    Don't worry. Enter your email address and we'll send you a secure password reset link.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="email" value={email} onChange={(e) =>setEmail(e.target.value)} placeholder="john@example.com" className="w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? "Sending Reset Link..." : "Send Reset Link"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-slate-900">
                                Email Sent
                            </h2>
                            <p className="mt-3 text-slate-600">
                                We've sent a password reset link to:
                            </p>
                            <p className="mt-2 font-semibold text-slate-900">
                                {email}
                            </p>
                            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                                The link will expire in 15 minutes for security reasons.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Links */}

                <div className="mt-6 text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;