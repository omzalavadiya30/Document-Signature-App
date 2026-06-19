"use client"
import RegisterForm from '@/components/auth/RegisterForm'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileSignature, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
    const router= useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/dashboard");
        }
    }, [router]);

    return (
        <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
            <div className="hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                <div className="inline-flex items-center gap-3 text-lg font-bold">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500 text-slate-950">
                        <FileSignature className="h-6 w-6" />
                    </span>
                    SignFlow
                </div>

                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-sm text-teal-200">
                        <ShieldCheck className="h-4 w-4" />
                        Secure document workflow
                    </p>
                    <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight xl:text-5xl">Create your signing workspace.</h1>
                    <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                        Keep requests, signers, and audit activity clear from the first upload.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
                    <div className="rounded-lg border border-white/10 p-4">
                        <p className="text-2xl font-bold text-white">PDF</p>
                        <p>Ready</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-4">
                        <p className="text-2xl font-bold text-white">Email</p>
                        <p>Invites</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-4">
                        <p className="text-2xl font-bold text-white">Audit</p>
                        <p>Trail</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center px-4 py-10 sm:px-6">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <FileSignature className="h-5 w-5" />
                        </span>
                        <span className="text-lg font-bold text-slate-950">SignFlow</span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-950">Create Account</h2>
                        <p className="mt-2 mb-8 text-sm text-slate-500">Join SignFlow today</p>
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default RegisterPage
