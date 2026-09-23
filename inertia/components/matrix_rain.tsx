import { useEffect, useRef } from 'react'

const CHARACTERS = '01'
const FONT_SIZE = 16

/**
 * Falling 0/1 "Matrix rain" background, drawn on a full-viewport canvas
 * behind the landing page content. Skips the animation loop entirely under
 * prefers-reduced-motion, showing a single static frame instead.
 */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let columns = 0
    let drops: number[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      columns = Math.floor(canvas!.width / FONT_SIZE)
      drops = new Array(columns).fill(1)
    }
    resize()
    window.addEventListener('resize', resize)

    function drawFrame() {
      if (!ctx) return
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx.fillStyle = '#22c55e'
      ctx.font = `${FONT_SIZE}px var(--font-mono, monospace)`

      for (let i = 0; i < drops.length; i++) {
        const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE)

        if (drops[i] * FONT_SIZE > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < 40; i++) drawFrame()
      return () => window.removeEventListener('resize', resize)
    }

    const interval = window.setInterval(drawFrame, 50)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  )
}
