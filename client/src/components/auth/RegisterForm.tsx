"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validation';
import { registerUser } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import { z } from 'zod';

type RegisterFormValues = z.infer<typeof registerSchema>;

const getRequestErrorMessage = (error: unknown) => {
    const requestError = error as { response?: { data?: { message?: string } } }
    return requestError.response?.data?.message || "Registration failed";
};

const RegisterForm = () => {
    const router= useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }}= useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), mode: "onChange" });

    const onSubmit= async(data: RegisterFormValues) => {
        try {
            await registerUser(data);
            toast.success("Registration successful!");
            router.push("/login");
        } catch (error: unknown) {
            toast.error(getRequestErrorMessage(error));
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Full Name" {...register("name")} className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15" />
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.name?.message as string}</p>
            </div>

            <div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="Email" {...register("email")} className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15" />
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.email?.message as string}</p>      
            </div>

            <div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" {...register("password")} className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 rounded-md p-1 -translate-y-1/2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.password?.message as string}</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 py-3.5 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? <><Loader2 className='animate-spin' />Creating...</> : <> <UserPlus size={20} />Register</>}
            </button>
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? {" "}
                <Link href="/login" className="font-semibold text-slate-950 hover:underline">
                    Login here
                </Link>
            </p>
        </form>
    )
}

export default RegisterForm
