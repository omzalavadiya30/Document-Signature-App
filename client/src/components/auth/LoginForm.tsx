"use client";

import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const LoginForm = () => {
    const router = useRouter();
    const [showpassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({resolver: zodResolver(loginSchema)});

    const onSubmit = async (data: any) => {
        try {
            const response = await loginUser(data);

            localStorage.setItem("token", response.token);

            router.push("/dashboard");
        } catch (error) {
            alert("Invalid credentials");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
                <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-500" />
                    <input type="email" placeholder="Email" {...register("email")} className="w-full pl-12 p-4 rounded-xl border-gray-300 border outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"/>
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.email?.message as string}</p>
            </div>

            <div>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-500" />
                    <input type={showpassword ? "text" : "password"} placeholder="Password" {...register("password")} className="w-full pl-12 p-4 rounded-xl border-gray-300 border outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition" />
                    <button type="button" onClick={() => setShowPassword(!showpassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
                        {showpassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.password?.message as string}</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-8 py-4 rounded-xl bg-black text-white hover:bg-gray-800 transition flex justify-center items-center gap-3 font-medium">
                {isSubmitting ? <><Loader2 className='animate-spin' />Logging in...</> : <> <LogIn size={20} />Login</>}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-black hover:underline">
                    Register
                </Link>
            </p>
        </form>
    );
}

export default LoginForm;