import api from "@/lib/axios"

// Fetch all documents
export const getDocuments = async() => {
    const response = await api.get("/api/docs")

    return response.data;
}

// Fetch single document
export const getDocument= async(id: string) => {
    const response = await api.get(`/api/docs/${id}`)

    return response.data;
}

export const uploadDocument = async (formData: FormData) => {
    const response = await api.post("/api/docs/upload", formData);

    return response.data;
};