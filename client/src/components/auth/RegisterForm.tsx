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

const RegisterForm = () => {
    const router= useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }}= useForm({ resolver: zodResolver(registerSchema), mode: "onChange" });

    const onSubmit= async(data: any) => {
        try {
            await registerUser(data);
            toast.success("Registration successful!");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
                <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-500" />
                    <input type="text" placeholder="Full Name" {...register("name")} className="w-full pl-12 p-4 rounded-xl border-gray-300 border outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition" />
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.name?.message as string}</p>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-500" />
                    <input type="email" placeholder="Email" {...register("email")} className="w-full pl-12 p-4 rounded-xl border-gray-300 border outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition" />
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.email?.message as string}</p>      
            </div>

            <div>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-500" />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" {...register("password")} className="w-full pl-12 p-4 rounded-xl border-gray-300 border outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className="text-red-500 text-sm">{errors.password?.message as string}</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-8 py-4 rounded-xl bg-black text-white hover:bg-gray-800 transition flex justify-center items-center gap-3 font-medium">
                {isSubmitting ? <><Loader2 className='animate-spin' />Creating...</> : <> <UserPlus size={20} />Register</>}
            </button>
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? {" "}
                <Link href="/login" className="font-medium text-black hover:underline">
                    Login here
                </Link>
            </p>
        </form>
    )
}

export default RegisterForm
