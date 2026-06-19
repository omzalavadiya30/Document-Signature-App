import api from "@/lib/axios"

export const registerUser= async(data: {name: string, email: string, password: string}) => {
    const response= await api.post("/api/auth/register", data);
    return response.data;
}

export const loginUser= async(data: {email: string, password: string}) => {
    const response= await api.post("/api/auth/login", data);
    return response.data;
}

export const forgotPassword = async (email: string) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async (token: string, password: string) => {
    const response = await api.post(`/api/auth/reset-password/${token}`, { password });
    return response.data;
};