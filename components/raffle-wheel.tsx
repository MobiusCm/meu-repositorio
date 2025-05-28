"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

export function RaffleWheel() {
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const names = [
    "João Silva",
    "Maria Oliveira",
    "Carlos Santos",
    "Ana Pereira",
    "Lucas Costa",
    "Juliana Almeida",
    "Roberto Ferreira",
    "Fernanda Lima",
  ]

  const spinWheel = () => {
    if (spinning) return

    setSpinning(true)
    setWinner(null)

    // Random spin between 2000 and 5000 ms
    const spinTime = 2000 + Math.random() * 3000
    const winnerIndex = Math.floor(Math.random() * names.length)

    setTimeout(() => {
      setSpinning(false)
      setWinner(names[winnerIndex])

      // Trigger confetti
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const myConfetti = confetti.create(canvas, {
          resize: true,
          useWorker: true,
        })

        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }, spinTime)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-6">
        <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none"></canvas>
        <div
          className={`w-full h-full rounded-full border-4 border-primary relative overflow-hidden ${spinning ? "animate-spin" : ""}`}
          style={{ animationDuration: "0.5s" }}
        >
          {names.map((name, index) => {
            const rotation = (index * 360) / names.length
            return (
              <div
                key={index}
                className="absolute w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "center",
                  clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 25%)",
                }}
              >
                <div
                  className={`absolute top-0 left-1/2 w-1/2 h-1/2 -translate-x-1/2 flex items-center justify-center bg-primary/10 border-r border-primary/20 ${index % 2 === 0 ? "bg-primary/20" : ""}`}
                >
                  <span
                    className="text-xs font-medium rotate-90 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]"
                    style={{ transform: `rotate(${90 + rotation}deg)` }}
                  >
                    {name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-primary z-20"></div>
      </div>

      {winner && (
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">Winner:</p>
          <p className="text-xl font-bold text-primary">{winner}</p>
        </div>
      )}

      <Button onClick={spinWheel} disabled={spinning} className="min-w-[120px]">
        {spinning ? "Spinning..." : "Spin"}
      </Button>
    </div>
  )
}
