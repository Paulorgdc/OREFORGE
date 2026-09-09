import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator, RefreshControl, KeyboardTypeOptions,
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../lib/api'
import { Colors } from '../constants/colors'

interface User {
  id: string
  name: string
  email: string
}

interface XPData {
  level: number
  total: number
  current: number
  needed: number
  percent: number
}

interface Investment {
  id: string
  type: string
  name: string
  amount: string
  rate?: string
  institution?: string
  current_balance?: number
  yield_amount?: number
}

interface FormState {
  type: string
  name: string
  amount: string
  rate: string
  started_at: string
  institution: string
}

const TYPE_LABELS: Record<string, string> = {
  CDB: 'CDB', CDI: 'CDI', SELIC: 'Selic', POUPANCA: 'Poupança',
  TESOURO_DIRETO: 'Tesouro Direto', ACOES: 'Ações', FII: 'FII', CRIPTO: 'Cripto', OUTRO: 'Outro',
}
const TYPES = Object.keys(TYPE_LABELS)

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [xp, setXp] = useState<XPData | null>(null)
  const [investments, setInv] = useState<Investment[]>([])
  const [totals, setTotals] = useState({ balance: 0, yield: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefresh] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<FormState>({
    type: 'CDB',
    name: '',
    amount: '',
    rate: '',
    started_at: new Date().toISOString().split('T')[0],
    institution: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const token = await AsyncStorage.getItem('ore_token')
    if (!token) {
      router.replace('/')
      return
    }
    try {
      const [profile, invData] = await Promise.all([api.getProfile(), api.getInvestments()])
      setUser(profile.user)
      setXp(profile.xp)
      setInv(invData.investments)
      setTotals({ balance: invData.totalBalance, yield: invData.totalYield })
    } catch {
      router.replace('/')
    } finally {
      setLoading(false)
      setRefresh(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleLogout() {
    await AsyncStorage.multiRemove(['ore_token', 'ore_user'])
    router.replace('/')
  }

  async function handleAdd() {
    if (!form.name || !form.amount) {
      Alert.alert('Preencha nome e valor')
      return
    }
    setSaving(true)
    try {
      const res = await api.createInvestment({
        ...form,
        amount: parseFloat(form.amount),
        rate: form.rate ? parseFloat(form.rate) : undefined,
      })
      Alert.alert(`⛏️ +${res.xp?.xp || 30} XP!`, `Investimento "${form.name}" adicionado!`)
      setShowAdd(false)
      setForm({
        type: 'CDB',
        name: '',
        amount: '',
        rate: '',
        started_at: new Date().toISOString().split('T')[0],
        institution: '',
      })
      load()
    } catch (e: unknown) {
      const err = e as { message?: string }
      Alert.alert('Erro', err.message || 'Erro ao salvar investimento.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Remover', `Remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteInvestment(id)
            load()
          } catch (e: unknown) {
            const err = e as { message?: string }
            Alert.alert('Erro', err.message || 'Erro ao deletar investimento.')
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.accent, fontSize: 24 }}>⛏️</Text>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 12 }} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerLogo}>⛏️ ORE<Text style={{ color: Colors.accent }}>FORGE</Text></Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ color: Colors.muted, fontSize: 12 }}>{user?.name?.split(' ')[0]}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: Colors.muted, fontSize: 12 }}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefresh(true); load() }}
            tintColor={Colors.accent}
          />
        }
      >
        {xp && (
          <View style={s.xpCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ color: Colors.muted, fontSize: 11, letterSpacing: 1 }}>NÍVEL</Text>
                <Text style={{ color: Colors.accent, fontSize: 32, fontWeight: '900' }}>{xp.level} ⛏️</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: Colors.muted, fontSize: 11 }}>XP Total</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{xp.total?.toLocaleString()}</Text>
              </View>
            </View>
            <View style={s.xpTrack}>
              <View style={[s.xpFill, { width: `${Math.min(Math.max(xp.percent, 0), 100)}%` }]} />
            </View>
            <Text style={{ color: Colors.muted, fontSize: 11, marginTop: 6 }}>
              {xp.current} / {xp.needed} XP para o próximo nível
            </Text>
          </View>
        )}

        <View style={s.totalsRow}>
          {[
            { label: 'Patrimônio', value: fmt(totals.balance), color: '#fff' },
            { label: 'Rendimento', value: fmt(totals.yield), color: Colors.success },
            { label: 'Ativos', value: String(investments.length), color: Colors.accent },
          ].map(({ label, value, color }) => (
            <View key={label} style={s.totalCard}>
              <Text style={s.totalLabel}>{label}</Text>
              <Text style={[s.totalValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>Investimentos</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={{ color: '#000', fontWeight: '700', fontSize: 14 }}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {investments.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>⛏️</Text>
            <Text style={{ color: Colors.muted }}>Nenhum investimento ainda</Text>
            <TouchableOpacity onPress={() => setShowAdd(true)} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.accent }}>Adicionar o primeiro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          investments.map((inv) => {
            const yieldAmt = inv.yield_amount || 0
            const isPositive = yieldAmt >= 0
            return (
              <TouchableOpacity key={inv.id} style={s.invCard} onLongPress={() => handleDelete(inv.id, inv.name)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View>
                    <Text style={{ color: Colors.accent, fontSize: 11, fontWeight: '700' }}>{TYPE_LABELS[inv.type] || inv.type}</Text>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{inv.name}</Text>
                    {inv.institution ? <Text style={{ color: Colors.muted, fontSize: 12 }}>{inv.institution}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: Colors.muted, fontSize: 11 }}>Saldo atual</Text>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{fmt(inv.current_balance || parseFloat(inv.amount))}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: Colors.muted, fontSize: 12 }}>Investido: {fmt(parseFloat(inv.amount))}</Text>
                  <Text style={{ color: isPositive ? Colors.success : Colors.error, fontSize: 12, fontWeight: '600' }}>
                    {isPositive ? '+' : ''}{fmt(yieldAmt)}
                  </Text>
                </View>
                <Text style={{ color: Colors.muted, fontSize: 10, marginTop: 4 }}>Segure para remover</Text>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Novo Investimento</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={{ color: Colors.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.label}>TIPO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setForm({ ...form, type: t })}
                      style={[s.typeChip, form.type === t && s.typeChipActive]}
                    >
                      <Text style={{ color: form.type === t ? '#000' : Colors.muted, fontSize: 12, fontWeight: '600' }}>{TYPE_LABELS[t]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {[
                { label: 'NOME', key: 'name', placeholder: 'Ex: CDB Banco Inter', type: 'default' },
                { label: 'VALOR (R$)', key: 'amount', placeholder: '1000.00', type: 'numeric' },
                { label: 'TAXA A.A. (%)', key: 'rate', placeholder: '13.75', type: 'numeric' },
                { label: 'INSTITUIÇÃO', key: 'institution', placeholder: 'Banco Inter', type: 'default' },
                { label: 'DATA DE INÍCIO', key: 'started_at', placeholder: 'AAAA-MM-DD', type: 'default' },
              ].map(({ label, key, placeholder, type }) => (
                <View key={key}>
                  <Text style={s.label}>{label}</Text>
                  <TextInput
                    style={s.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.muted}
                    value={form[key as keyof FormState]}
                    onChangeText={v => setForm({ ...form, [key]: v })}
                    keyboardType={type as KeyboardTypeOptions}
                  />
                </View>
              ))}

              <TouchableOpacity style={[s.addBtn, { marginTop: 8, paddingVertical: 14 }]} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Adicionar ⛏️</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  headerLogo: { fontWeight: '900', fontSize: 18, color: '#fff' },
  xpCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  xpTrack: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 10, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 999 },
  totalsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  totalCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12 },
  totalLabel: { color: Colors.muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  totalValue: { fontWeight: '700', fontSize: 14 },
  addBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  empty: { backgroundColor: Colors.card, borderRadius: 16, padding: 40, alignItems: 'center' },
  invCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#0d1117', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  label: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 13, color: '#fff', fontSize: 14, marginBottom: 12 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  typeChipActive: { backgroundColor: Colors.accent },
})