"use client"
interface SignaturePlaceholderProps  {
    x: number,
    y: number
}

// Displays previously saved signature locations.
const SignaturePlaceholder = ({x, y}: SignaturePlaceholderProps ) => {
    return (
        <div className='absolute border-2 border-green-500 bg-green-100/40 rounded-md w-40 h-16 flex items-center justify-center font-medium' style={{ left: x, top: y}}>
            Sign Here
        </div>
    )
}

export default SignaturePlaceholder
