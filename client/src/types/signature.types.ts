// Signature Type

export interface Signature {
    _id: string,
    documentId: string,
    signer: string,
    page: number,
    x: number,
    y: number,
    status: | "Pending" | "Signed" | "Rejected"
}