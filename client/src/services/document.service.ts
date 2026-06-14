import api from "@/lib/axios"

// Returns authorization header required for protected APIs.
const getAuthHeader= () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
})


// Fetch all documents
export const getDocuments = async() => {
    const response = await api.get("/api/docs", { 
        headers: getAuthHeader()
    })

    return response.data;
}

// Fetch single document
export const getDocument= async(id: string) => {
    const response = await api.get(`/api/docs/${id}`, { 
        headers: getAuthHeader()
    })

    return response.data;
}