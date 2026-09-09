const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ore_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data as T
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Investments ───────────────────────────────────────────────────────────────
export const investments = {
  list: () => request<{ investments: Investment[]; totalBalance: number; totalYield: number }>('/investments'),

  create: (body: InvestmentPayload) =>
    request<{ investment: Investment; xp: XPResult; achievements: string[] }>(
      '/investments',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  update: (id: string, body: Partial<InvestmentPayload>) =>
    request<{ investment: Investment }>(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/investments/${id}`, { method: 'DELETE' }),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = {
  me: () => request<{ user: User; xp: XPData; recentEvents: XPEvent[]; achievements: Achievement[] }>('/users/me'),
}

// ── Types ────────────────────────────────────────────────────────────────────
export type InvestmentType = 'CDB' | 'CDI' | 'SELIC' | 'POUPANCA' | 'TESOURO_DIRETO' | 'ACOES' | 'FII' | 'CRIPTO' | 'OUTRO'

export interface User {
  id: string
  name: string
  email: string
  xp: number
  level: number
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  type: InvestmentType
  name: string
  amount: string
  rate: string
  rate_index: string
  rate_percent: string
  started_at: string
  due_at: string | null
  institution: string
  notes: string
  is_active: boolean
  created_at: string
  current_balance: number
  yield_amount: number
}

export interface InvestmentPayload {
  type: InvestmentType
  name: string
  amount: number
  rate?: number
  rate_index?: string
  rate_percent?: number
  started_at: string
  due_at?: string
  institution?: string
  notes?: string
}

export interface XPResult {
  xp: number
  level: number
}

export interface XPData {
  current: number
  needed: number
  percent: number
  level: number
  total: number
}

export interface XPEvent {
  id: string
  action: string
  xp_gained: number
  description: string
  created_at: string
}

export interface Achievement {
  id: string
  key: string
  unlocked_at: string
}