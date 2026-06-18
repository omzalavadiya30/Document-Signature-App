import api from "@/lib/axios";

// Save signature.
export const saveSignature= async(data: { documentId: string; page: number; x: number; y: number; }) => {
    const token= localStorage.getItem("token")
    const response= await api.post("/api/signatures", data, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return response.data
}

// Fetch signatures.
export const getSignatures= async(documentId: string) => {
    const token= localStorage.getItem("token")
    const response= await api.get(`/api/signatures/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
}

// Generate signed PDF
export const finalizeSignature= async(documentId: string) => {
    const token= localStorage.getItem("token")

    const response= await api.post("/api/signatures/finalize", {documentId}, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data
}