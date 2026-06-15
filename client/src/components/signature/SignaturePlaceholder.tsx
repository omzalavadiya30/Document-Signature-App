"use client"
interface Props {
    x: number,
    y: number
}

//  Displays signature location on PDF preview.
const SignaturePlaceholder = ({x, y}: Props) => {
    return (
        <div className='absolute border-2 border-blue-500 bg-blue-100/40 rounded-md w-40 h-16 flex items-center justify-center font-medium' style={{ left: x, top: y}}>
            Sign Here
        </div>
    )
}

export default SignaturePlaceholder
