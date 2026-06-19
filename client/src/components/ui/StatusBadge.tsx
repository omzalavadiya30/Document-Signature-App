import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { Document } from "@/types/document.types";

type Status = Document["status"];

interface StatusBadgeProps {
    status: Status;
    size?: "sm" | "md";
}

const statusConfig = {
    Pending: {
        icon: Clock3,
        className: "border-amber-200 bg-amber-50 text-amber-700"
    },
    Signed: {
        icon: CheckCircle2,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    },
    Rejected: {
        icon: XCircle,
        className: "border-rose-200 bg-rose-50 text-rose-700"
    }
};

const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    const sizing = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
    const iconSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizing} ${config.className}`}>
            <Icon className={iconSize} />
            {status}
        </span>
    );
};

export default StatusBadge;
