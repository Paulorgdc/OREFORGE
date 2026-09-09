import React from 'react'

interface ForgeFlameCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function ForgeFlameCard({ children, style }: ForgeFlameCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 20,
        padding: 32,
        border: '1px solid rgba(245, 158, 11, 0.2)',
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.12)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}