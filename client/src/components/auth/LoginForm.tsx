"use client";

import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
    const router = useRouter();
    const [showpassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({resolver: zodResolver(loginSchema)});

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await loginUser(data);
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            toast.success("Login Successful")
            router.push("/dashboard");
        } catch (error) {
            console.error("Login Error: ", error);
            toast.error("Invalid credentials");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="Email" {...register("email")} className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"/>
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.email?.message as string}</p>
            </div>

            <div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type={showpassword ? "text" : "password"} placeholder="Password" {...register("password")} className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15" />
                    <button type="button" onClick={() => setShowPassword(!showpassword)} className="absolute right-3 top-1/2 rounded-md p-1 -translate-y-1/2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" aria-label={showpassword ? "Hide password" : "Show password"}>
                        {showpassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className="text-red-500 text-sm mt-2">{errors.password?.message as string}</p>
            </div>

            <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot Password?
                </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 py-3.5 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? <><Loader2 className='animate-spin' />Logging in...</> : <> <LogIn size={20} />Login</>}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
                No account yet?{" "}
                <Link href="/register" className="font-semibold text-slate-950 hover:underline">
                    Register
                </Link>
            </p>
        </form>
    );
}

export default LoginForm;
