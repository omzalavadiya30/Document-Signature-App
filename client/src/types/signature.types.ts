// Signature Type

export interface Signature {
    _id: string,
    documentId: string,
    signer?: string | null,
    signerEmail?: string | null,
    page: number,
    x: number,
    y: number,
    status: | "Pending" | "Signed" | "Rejected"
    rejectionReason?: string | null,
    signedAt?: string | null,
    rejectedAt?: string | null
}

export interface SignatureStatus {
    success: boolean,
    status: "Pending" | "Signed" | "Rejected",
    inviteStatus?: "Pending" | "Signed" | "Rejected",
    rejectionReason?: string | null,
    signedAt?: string | null,
    rejectedAt?: string | null
}
