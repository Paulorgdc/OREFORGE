'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('ore_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Erro ao ler dados do usuário:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('ore_token')
    localStorage.removeItem('ore_user')
    setUser(null)
    window.location.reload()
  }

  return (
    <header
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        borderBottom: '1px solid rgba(245,158,11,0.15)',
        background: 'rgba(8,11,20,0.6)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
        <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>
          ORE<span style={{ color: '#f59e0b' }}>FORGE</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sair
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f59e0b',
                fontWeight: 600,
                fontSize: 14,
                padding: '8px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Entrar
            </button>
            <Link
              href="/register"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                padding: '9px 18px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Criar Conta
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}