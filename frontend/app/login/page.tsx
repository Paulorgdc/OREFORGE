'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/api'
import ForgeFlameCard from '@/components/ForgeFlameCard'
import ForgeFlameBackground from '@/components/ForgeFlameBackground'

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cleanEmail = form.email.trim().toLowerCase()
      const { token, user } = await auth.login({ email: cleanEmail, password: form.password })
      localStorage.setItem('ore_token', token)
      localStorage.setItem('ore_user', JSON.stringify(user))
      router.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('fetch failed') || msg.includes('Failed to fetch')) {
        setError('Sem conexão com o servidor. Verifique sua rede e tente novamente.')
      } else {
        setError(msg || 'Erro ao fazer login')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    padding: 0,
  }

  const wrap: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: '13px 16px',
    gap: 8,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <ForgeFlameBackground />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>
              ORE<span style={{ color: '#f59e0b' }}>FORGE</span>
            </div>
          </Link>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 8 }}>Entre na sua conta</p>
        </div>

        <ForgeFlameCard>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="login-email" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>EMAIL</label>
              <div style={wrap}>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputBase}
                />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label htmlFor="login-password" style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.5 }}>SENHA</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: '#f59e0b', textDecoration: 'none' }}>Esqueci a senha</Link>
              </div>
              <div style={wrap}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputBase}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Alternar visibilidade da senha"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}
                >
                  {showPass ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? '#92400e' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, fontFamily: 'inherit' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </ForgeFlameCard>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#475569', marginTop: 24 }}>
          Não tem conta?{' '}
          <Link href="/register" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>Criar conta grátis</Link>
        </p>
      </div>
    </div>
  )
}