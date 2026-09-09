'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const checks = useMemo(() => checkPassword(newPassword), [newPassword])
  const passwordOk = Object.values(checks).every(Boolean)
  const confirmOk = confirmPassword === newPassword && confirmPassword.length > 0

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oreforge-z2gx.onrender.com'

  // Etapa 1: Enviar Código
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar código')

      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  // Etapa 2: Validar Código
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Código inválido')

      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Código incorreto ou expirado')
    } finally {
      setLoading(false)
    }
  }

  // Etapa 3: Redefinir Senha
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordOk) { setError('A senha não atende todos os requisitos'); return }
    if (!confirmOk) { setError('As senhas não coincidem'); return }

    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha')

      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 24, position: 'relative', color: '#fff', overflow: 'hidden' }}>
      <ForgeFlameBackground />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>
              ORE<span style={{ color: '#f59e0b' }}>FORGE</span>
            </div>
          </Link>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 8 }}>Recuperar senha</p>
        </div>

        <ForgeFlameCard>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                Digite seu email e enviaremos um código de verificação para redefinir sua senha.
              </p>
              <div>
                <label htmlFor="recovery-email" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>EMAIL</label>
                <div style={wrap()}>
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputBase}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? '#92400e' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Enviando...' : 'Enviar código de verificação'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                Digite o código de 6 dígitos gerado para <strong>{email}</strong>.
              </p>
              <div>
                <label htmlFor="reset-code" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>CÓDIGO DE VERIFICAÇÃO</label>
                <div style={wrap()}>
                  <input
                    id="reset-code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    style={{ ...inputBase, textAlign: 'center', letterSpacing: 6, fontSize: 18, fontWeight: 'bold' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? '#92400e' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Verificando...' : 'Validar Código'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
              >
                ← Alterar e-mail
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label htmlFor="new-password" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>NOVA SENHA</label>
                <div style={wrap()}>
                  <input
                    id="new-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Crie uma nova senha"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}
                  >
                    {showPass ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              <div>
                <label htmlFor="confirm-password" style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>CONFIRMAR NOVA SENHA</label>
                <div style={wrap(confirmPassword.length > 0 && !confirmOk)}>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569', display: 'flex' }}
                  >
                    {showConfirm ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p style={{ fontSize: 12, marginTop: 6, color: confirmOk ? '#22c55e' : '#ef4444' }}>
                    {confirmOk ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? '#92400e' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Atualizando...' : 'Redefinir Senha'}
              </button>
            </form>
          )}
        </ForgeFlameCard>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#475569', marginTop: 24 }}>
          Lembrou a senha?{' '}
          <Link href="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}