'use client'
import { useEffect, useRef } from 'react'

export default function ForgeFlameBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const sparksCount = 50
    const sparks = Array.from({ length: sparksCount }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      speedY: Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.8 + 0.2,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      sparks.forEach((s) => {
        s.y -= s.speedY
        s.x += s.speedX
        s.opacity -= 0.003

        if (s.y < -10 || s.opacity <= 0) {
          s.y = height + 10
          s.x = Math.random() * width
          s.opacity = Math.random() * 0.8 + 0.2
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 158, 11, ${s.opacity})`
        ctx.shadowBlur = 8
        ctx.shadowColor = '#f59e0b'
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: '#080b14', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120vw',
          height: '45vh',
          background: 'radial-gradient(ellipse at bottom, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 80%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}