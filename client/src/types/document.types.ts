// Document type used throughout the application. Shared document type.
export interface Document {
    _id: string;
    title: string;
    fileName: string;
    filePath: string;
    status: "Pending" | "Signed" | "Rejected";
    signedFileName?: string;
    signedFilePath?: string;
    createdAt: string;
}