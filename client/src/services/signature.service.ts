import api from "@/lib/axios";

// Auth header.
const getHeaders= () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
})

// Save signature.
export const saveSignature= async(data: { documentId: string; page: number; x: number; y: number; }) => {
    const response= await api.post("/api/signatures", data, {
        headers: getHeaders(),
    })

    return response.data
}

// Fetch signatures.
export const getSignatures= async(documentId: string) => {
    const response= await api.get(`/api/signatures/${documentId}`, {
        headers: getHeaders()
    });

    return response.data;
}