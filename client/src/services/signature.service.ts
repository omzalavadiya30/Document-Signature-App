import api from "@/lib/axios";

// Save signature.
export const saveSignature= async(data: { documentId: string; page: number; x: number; y: number; }) => {
    const response= await api.post("/api/signatures", data)

    return response.data
}

// Fetch signatures.
export const getSignatures= async(documentId: string) => {
    const response= await api.get(`/api/signatures/${documentId}`);

    return response.data;
}

// Generate signed PDF
export const finalizeSignature= async(documentId: string) => {
    const response= await api.post("/api/signatures/finalize", {documentId});

    return response.data
}

// Get public document by token (no auth required)
export const getPublicDocument= async(token: string) => {
    const response= await api.get(`/api/signatures/public/${token}`)
    return response.data
}

// Invite signer via email (send signature link)
export const inviteSigner = async(documentId: string, signerEmail: string) => {
    const response = await api.post("/api/signatures/invite", { documentId, signerEmail })
    return response.data
}

export const acceptSignatureInvite = async(token: string) => {
    const response = await api.post(`/api/signatures/public/${token}/accept`)
    return response.data
}

export const rejectSignatureInvite = async(token: string, reason: string) => {
    const response = await api.post(`/api/signatures/public/${token}/reject`, { reason })
    return response.data
}

export const getSignatureStatus = async(token: string) => {
    const response = await api.get(`/api/signatures/public/${token}/status`)
    return response.data
}

export const submitPublicSignature = async(token: string, coordinates: { page: number; x: number; y: number }[]) => {
    const response = await api.post(`/api/signatures/public/${token}/submit`, { coordinates })
    return response.data
}
