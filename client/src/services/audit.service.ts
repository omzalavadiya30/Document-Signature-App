import api from "@/lib/axios";

// Get audit logs for a document
export const getDocumentAudit = async (documentId: string, skip: number = 0, limit: number = 50) => {
    const token = localStorage.getItem("token");
    const response = await api.get(`/api/audit/${documentId}?skip=${skip}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Get audit statistics for a document
export const getAuditStatistics = async (documentId: string) => {
    const token = localStorage.getItem("token");
    const response = await api.get(`/api/audit/${documentId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Get all audit logs (Admin only)
export const getAllAuditLogs = async (skip: number = 0, limit: number = 50, action?: string, userId?: string) => {
    const token = localStorage.getItem("token");
    let url = `/api/audit?skip=${skip}&limit=${limit}`;
    if (action) url += `&action=${action}`;
    if (userId) url += `&userId=${userId}`;
    
    const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
