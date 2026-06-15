"use client";

interface Props {
    onSave: (
        x: number,
        y: number
    ) => void
}

// Captures click position on PDF document.
const SignatureOverlay = ({ onSave }: Props) => {

    const handleClick= (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("CLICKED");
        const rect= event.currentTarget.getBoundingClientRect();

        const x= event.clientX - rect.left;
        const y= event.clientY - rect.top;
        onSave(x, y)
    }

    return (
        <div className="absolute inset-0 cursor-crosshair z-50" onClick={handleClick}></div>
    )
}

export default SignatureOverlay
