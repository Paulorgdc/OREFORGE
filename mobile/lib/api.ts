import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RENDER_URL = 'https://oreforge-z2gx.onrender.com'
const envUrl = process.env.EXPO_PUBLIC_API_URL

const BASE = envUrl || (Platform.OS === 'web' ? 'http://localhost:3333' : RENDER_URL)

export interface User {
  id: string
  name: string
  email: string
  created_at?: string
}

export interface InvestmentPayload {
  type: string
  name: string
  amount: number
  rate?: number
  started_at: string
  institution?: string
  notes?: string
}

export interface InvestmentItem {
  id: string
  user_id: string
  type: string
  name: string
  amount: string
  rate?: string
  started_at: string
  institution?: string
  is_active: boolean
  current_balance?: number
  yield_amount?: number
}

export interface HistoryPoint {
  date: string
  balance: number
  yield: number
}

export interface XPData {
  level: number
  total: number
  current: number
  needed: number
  percent: number
}

export interface UserStats {
  totalBalance: number
  totalInvested: number
  totalInvestments: number
  uniqueTypes: number
  maxDaysActive: number
}

export interface XPEvent {
  id: string
  description: string
  xp_gained: number
  created_at: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('ore_token')
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message || 'Erro na requisição')
    return data as T
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (
      err.message?.includes('SSL') ||
      err.message?.includes('certificate') ||
      err.message?.includes('SSLHandshake')
    ) {
      throw new Error('Erro de conexão segura. Verifique a data e hora do seu celular nas configurações.')
    }
    if (err.message?.includes('fetch failed') || err.message?.includes('Network')) {
      throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.')
    }
    throw err
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // Recuperação de Senha - Etapa 1: Enviar Código
  forgotPassword: (email: string) =>
    request<{ message: string; code?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Recuperação de Senha - Etapa 2: Validar Código
  verifyResetCode: (email: string, code: string) =>
    request<{ valid: boolean }>('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  // Recuperação de Senha - Etapa 3: Redefinir Senha
  resetPassword: (email: string, code: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),

  getInvestments: () =>
    request<{ investments: InvestmentItem[]; totalBalance: number; totalYield: number }>('/investments'),

  createInvestment: (data: InvestmentPayload) =>
    request<{ investment: InvestmentItem; xp: { xp: number; level: number } }>('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInvestment: (id: string, data: Partial<InvestmentPayload>) =>
    request<{ investment: InvestmentItem }>(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteInvestment: (id: string) =>
    request<{ ok: boolean }>(`/investments/${id}`, { method: 'DELETE' }),

  getHistory: (id: string) =>
    request<{ investment: InvestmentItem; history: HistoryPoint[] }>(`/investments/${id}/history`),

  getProfile: () =>
    request<{
      user: User
      xp: XPData
      stats: UserStats
      recentEvents: XPEvent[]
      achievements: string[]
      newAchievements: string[]
    }>('/users/me'),

  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    request<{ user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}