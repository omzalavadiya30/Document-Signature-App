"use client";

import { resetPassword } from "@/services/auth.service";
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Validate password fields.
 */
const validatePassword = (password: string, confirmPassword: string) => {
    const validations = [
        {
            condition: !password.trim(),
            message: "Password is required"
        },   
        {
            condition: password.length < 8,
            message: "Password must be at least 8 characters"
        },
        {
            condition: !/(?=.*[A-Z])/.test(password),
            message: "Password must contain at least one uppercase letter"
        },
        {
            condition: !/(?=.*[a-z])/.test(password),
            message: "Password must contain at least one lowercase letter"
        },
        {
            condition: !/(?=.*[0-9])/.test(password),
            message: "Password must contain at least one number"
        },
        {
            condition: !/(?=.*[@$!%*?&])/.test(password),
            message: "Password must contain at least one special character"
        },
        {
            condition: password !== confirmPassword,
            message: "Passwords do not match"
        }
    ];

    return validations.find(validation => validation.condition);
};

const ResetPasswordPage = () => {
    const router = useRouter();
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validatePassword(password,confirmPassword);

        if (validationError) {
            toast.error(validationError.message);
            return;
        }

        try {
            setLoading(true);

            await resetPassword(token as string, password);
            setSuccess(true);

            toast.success("Password reset successfully");

            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
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
                                    <Lock className="h-10 w-10 text-blue-600" />
                                </div>
                                <h1 className="mt-6 text-4xl font-bold text-slate-900">
                                    Reset Password
                                </h1>
                                <p className="mt-3 text-slate-600">
                                    Create a new secure password for your account.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                {/* Password */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                        <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Minimum 8 characters, uppercase, lowercase, number and special character.
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                                        <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                                    {loading ? "Updating Password..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-slate-900">
                                Password Updated
                            </h2>
                            <p className="mt-3 text-slate-600">
                                Your password has been changed successfully.
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Redirecting to login...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage;