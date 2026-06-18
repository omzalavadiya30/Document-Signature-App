"use client"
import { useDraggable } from "@dnd-kit/core";

interface Props {
  id: string;
  x: number;
  y: number;
}

// Allows users to drag the signature placeholder anywhere on the PDF.
const DraggableSignature = ({id, x, y}: Props) => {
  const { attributes, listeners, setNodeRef, transform }= useDraggable({id});

  const style= {
    left: x,
    top: y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  }

  return (
    <div id="draggable-signature" ref={setNodeRef} style={style} {...listeners} {...attributes} className="absolute w-40 h-16 border-2 border-blue-500 bg-blue-100/40 rounded-md flex items-center justify-center font-medium cursor-move z-50">
      Sign Here
    </div>
  )
}

export default DraggableSignature
