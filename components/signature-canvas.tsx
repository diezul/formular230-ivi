"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface SignatureCanvasProps {
  onSignatureChange: (data: string | null) => void
}

export default function SignatureCanvas({ onSignatureChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas background
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add a border
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    // Get position
    let x, y
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get position
    let x, y
    if ("touches" in e) {
      e.preventDefault() // Prevent scrolling when drawing
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Save signature data
    const signatureData = canvas.toDataURL("image/png")
    onSignatureChange(signatureData)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add a border
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className="w-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={clearCanvas} disabled={!hasSignature}>
          Șterge
        </Button>
      </div>
    </div>
  )
}
