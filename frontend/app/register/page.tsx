'use client'
import { useState, useMemo } from 'react'
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

function checkPassword(pwd: string) {
  return {
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
  }
}

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => checkPassword(password), [password])
  const score = Object.values(checks).filter(Boolean).length

  const strength = score <= 1 ? { label: 'Muito fraca', color: '#ef4444', width: '20%' }
    : score <= 2 ? { label: 'Fraca', color: '#f97316', width: '40%' }
    : score <= 3 ? { label: 'Pode melhorar', color: '#f59e0b', width: '60%' }
    : score === 4 ? { label: 'Boa', color: '#84cc16', width: '80%' }
    : { label: 'Forte', color: '#22c55e', width: '100%' }

  if (!password) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>Força da senha</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: strength.color }}>{strength.label}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 999, transition: 'width 0.3s ease, background 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {[
          { key: 'length', label: '6+ caracteres' },
          { key: 'upper', label: 'Maiúscula' },
          { key: 'lower', label: 'Minúscula' },
          { key: 'number', label: 'Número' },
          { key: 'symbol', label: 'Símbolo' },
        ].map(({ key, label }) => {
          const ok = checks[key as keyof typeof checks]
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: ok ? '#22c55e' : '#475569' }}>
              <span>{ok ? '✓' : '○'}</span>
              <span>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const checks = useMemo(() => checkPassword(form.password), [form.password])
  const passwordOk = Object.values(checks).every(Boolean)
  const confirmOk = form.confirm === form.password && form.confirm.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordOk) { setError('A senha não atende todos os requisitos'); return }
    if (!confirmOk) { setError('As senhas não coincidem'); return }
    setError('')
    setLoading(true)
    try {
      const cleanEmail = form.email.trim().toLowerCase()
      const { token, user } = await auth.register({ name: form.name.trim(), email: cleanEmail, password: form.password })
      localStorage.setItem('ore_token', token)
      localStorage.setItem('ore_user', JSON.stringify(user))
      router.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('fetch failed') || msg.includes('Failed to fetch')) {
        setError('Sem conexão com o servidor. Verifique sua rede e tente novamente.')
      } else {
        setError(msg || 'Erro ao criar conta')
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

  const wrap = (hasError?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: '13px 16px',
    gap: 8,
    outline: hasError ? '1px solid rgba(239,68,68,0.5)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '24px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <ForgeFlameBackground />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10, paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>
              ORE<span style={{ color: '#f59e0b' }}>FORGE</span>
            </div>
          </Link>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 8 }}>Crie sua conta e comece a minerar</p>
        </div>

        <ForgeFlameCard>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="register-name" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>NOME</label>
              <div style={wrap()}>
                <input
                  id="register-name"
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputBase}
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>EMAIL</label>
              <div style={wrap()}>
                <input
                  id="register-email"
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
              <label htmlFor="register-password" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>SENHA</label>
              <div style={wrap()}>
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Crie uma senha forte"
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
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label htmlFor="register-confirm" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>CONFIRMAR SENHA</label>
              <div style={wrap(form.confirm.length > 0 && !confirmOk)}>
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Repita a senha"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  style={inputBase}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Alternar visibilidade da confirmação de senha"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}
                >
                  {showConfirm ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
              {form.confirm.length > 0 && (
                <p style={{ fontSize: 12, marginTop: 6, color: confirmOk ? '#22c55e' : '#ef4444' }}>
                  {confirmOk ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                </p>
              )}
            </div>

            <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f59e0b' }}>
              Você ganha <strong>+50 XP</strong> ao criar sua conta!
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? '#92400e' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>
        </ForgeFlameCard>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#475569', marginTop: 24 }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}