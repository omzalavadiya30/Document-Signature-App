"use client"
import RegisterForm from '@/components/auth/RegisterForm'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const RegisterPage = () => {
    const router= useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/login");
        }
    }, []);

    return (
        <main className="min-h-screen grid lg:grid-cols-2">
            {/* Left Section */}
            <div className="hidden lg:flex flex-col justify-center bg-black text-white p-16">
                <h1 className="text-5xl font-bold mb-6">SignFlow</h1>
                <p className="text-lg text-gray-300 max-w-md">
                    Create an account and start managing documents digitally from anywhere.
                </p>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-center bg-gray-50 px-6">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
                        <p className="text-center text-gray-500 mb-8">Join SignFlow today</p>
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default RegisterPage
