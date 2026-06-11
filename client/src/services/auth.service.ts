import api from "@/lib/axios"

export const registerUser= async(data: {name: string, email: string, password: string}) => {
    const response= await api.post("/api/auth/register", data);
    return response.data;
}

export const loginUser= async(data: {email: string, password: string}) => {
    const response= await api.post("/api/auth/login", data);
    return response.data;
}