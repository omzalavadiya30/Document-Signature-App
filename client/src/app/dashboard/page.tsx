"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react";

const DashboardPage = () => {
    const router= useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <p>Login successful.</p>
        </div>
    )
}

export default DashboardPage
