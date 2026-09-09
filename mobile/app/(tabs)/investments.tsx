import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator, RefreshControl, Platform
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'

interface Investment {
  id: string
  user_id: string
  type: string
  name: string
  amount: string
  rate?: string
  started_at: string
  due_at?: string | null
  institution?: string
  notes?: string
  is_active: boolean
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
  TESOURO_DIRETO: 'Tesouro Direto', ACOES: 'Ações',
  FII: 'FII', CRIPTO: 'Cripto', OUTRO: 'Outro',
}

const TYPES_WITH_RATE = ['CDB', 'CDI', 'SELIC', 'POUPANCA', 'TESOURO_DIRETO']
const CDI_ATUAL = 13.65

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtPct(n: number, decimals = 4) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`
}

export default function InvestmentsScreen() {
  const [investments, setInv] = useState<Investment[]>([])
  const [totals, setTotals] = useState({ balance: 0, yield: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefresh] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const [form, setForm] = useState<FormState>({
    type: 'CDB',
    name: '',
    amount: '',
    rate: '100',
    started_at: new Date().toISOString().split('T')[0],
    institution: '',
  })
  const [saving, setSaving] = useState(false)

  const [editingItem, setEditingItem] = useState<Investment | null>(null)
  const [editForm, setEditForm] = useState<FormState>({
    type: 'CDB',
    name: '',
    amount: '',
    rate: '',
    started_at: '',
    institution: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.getInvestments()
      setInv(data.investments)
      setTotals({ balance: data.totalBalance, yield: data.totalYield })
    } catch (e: unknown) {
      const err = e as { message?: string }
      if (err.message?.includes('Token') || err.message?.includes('autorizado')) {
        router.replace('/')
      }
    } finally {
      setLoading(false)
      setRefresh(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  async function handleAdd() {
    if (!form.name || !form.amount) {
      Alert.alert('Campos obrigatórios', 'Preencha pelo menos o nome e o valor.')
      return
    }

    setSaving(true)
    try {
      const needsRate = TYPES_WITH_RATE.includes(form.type)
      const cdiPct = parseFloat(form.rate || '100')
      const taxaEfetivaAnual = needsRate ? (cdiPct / 100) * CDI_ATUAL : undefined

      const res = await api.createInvestment({
        ...form,
        amount: parseFloat(form.amount),
        rate: taxaEfetivaAnual && taxaEfetivaAnual > 0 ? taxaEfetivaAnual : undefined,
      })

      Alert.alert(`⛏️ +${res.xp?.xp || 30} XP!`, `"${form.name}" adicionado com sucesso!`)
      setShowAdd(false)
      setForm({
        type: 'CDB', name: '', amount: '', rate: '100',
        started_at: new Date().toISOString().split('T')[0], institution: '',
      })
      load()
    } catch (e: unknown) {
      const err = e as { message?: string }
      Alert.alert('Erro ao adicionar', err.message || 'Falha ao processar solicitação.')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(inv: Investment) {
    setEditingItem(inv)
    let cdiDisplay = ''
    if (inv.rate) {
      cdiDisplay = ((parseFloat(inv.rate) / CDI_ATUAL) * 100).toFixed(0)
    }

    setEditForm({
      type: inv.type,
      name: inv.name,
      amount: String(inv.amount || ''),
      rate: cdiDisplay || '100',
      started_at: inv.started_at ? inv.started_at.split('T')[0] : '',
      institution: inv.institution || '',
    })
  }

  async function handleSaveEdit() {
    if (!editingItem) return
    if (!editForm.name.trim() || !editForm.amount) {
      Alert.alert('Atenção', 'Informe pelo menos o nome e o valor.')
      return
    }

    setSavingEdit(true)
    try {
      const needsRate = TYPES_WITH_RATE.includes(editForm.type)
      const cdiPct = parseFloat(editForm.rate || '100')
      const taxaEfetivaAnual = needsRate ? (cdiPct / 100) * CDI_ATUAL : undefined

      await api.updateInvestment(editingItem.id, {
        type: editForm.type,
        name: editForm.name.trim(),
        amount: parseFloat(editForm.amount),
        rate: taxaEfetivaAnual && taxaEfetivaAnual > 0 ? taxaEfetivaAnual : undefined,
        institution: editForm.institution.trim() || undefined,
        started_at: editForm.started_at,
      })

      setEditingItem(null)
      load()
    } catch (e: unknown) {
      const err = e as { message?: string }
      Alert.alert('Erro ao atualizar', err.message || 'Falha ao salvar edições.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirm = async () => {
      try {
        await api.deleteInvestment(id)
        load()
      } catch (e: unknown) {
        const err = e as { message?: string }
        Alert.alert('Erro', err.message || 'Erro ao remover investimento.')
      }
    }

    const msg = `Deseja remover "${name}"? Seu XP acumulado continuará salvo.`
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) confirm()
    } else {
      Alert.alert('Remover investimento', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: confirm },
      ])
    }
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    )
  }

  const totalInvested = investments.reduce((sum, i) => sum + parseFloat(i.amount), 0)
  const totalYieldPct = totalInvested > 0 ? (totals.yield / totalInvested) * 100 : 0

  return (
    <View style={s.container}>
      {/* Header Padronizado */}
      <View style={s.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.logoWhite}>ORE</Text>
            <Text style={s.logoOrange}>FORGE</Text>
          </View>
          <Text style={s.headerSubtitle}>INVESTIMENTOS</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefresh(true); load() }} tintColor={Colors.accent} />}
      >
        <View style={s.totalsRow}>
          {[
            ['Patrimônio', fmt(totals.balance), '#fff'],
            ['Rendimento', fmt(totals.yield), totals.yield >= 0 ? Colors.success : Colors.error],
            ['Ativos', String(investments.length), Colors.accent],
          ].map(([l, v, c]) => (
            <View key={l} style={s.totalCard}>
              <Text style={s.totalLabel}>{l}</Text>
              <Text style={[s.totalValue, { color: c }]}>{v}</Text>
            </View>
          ))}
        </View>

        {investments.length > 0 && (
          <View style={s.yieldCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: Colors.muted, fontSize: 12 }}>Rentabilidade geral</Text>
              <Text style={{ color: totalYieldPct >= 0 ? Colors.success : Colors.error, fontWeight: '700', fontSize: 14 }}>
                {fmtPct(totalYieldPct, 2)}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 6 }}>
              <View style={{
                height: 6,
                width: `${Math.min(Math.abs(totalYieldPct) * 5, 100)}%`,
                backgroundColor: totalYieldPct >= 0 ? Colors.success : Colors.error,
                borderRadius: 999,
              }} />
            </View>
          </View>
        )}

        {investments.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>⛏️</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
              Nenhum investimento ainda
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
              Adicione seu primeiro investimento e comece a minerar seu futuro
            </Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
              <Text style={{ color: '#000', fontWeight: '700' }}>+ Adicionar primeiro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          investments.map((inv) => {
            const yieldAmt = inv.yield_amount || 0
            const yieldPct = parseFloat(inv.amount) > 0 ? (yieldAmt / parseFloat(inv.amount)) * 100 : 0
            const isPositive = yieldAmt >= 0
            const yieldColor = isPositive ? Colors.success : Colors.error
            const daysSince = Math.floor((Date.now() - new Date(inv.started_at).getTime()) / 86400000)
            const cdiEquivalent = inv.rate ? ((parseFloat(inv.rate) / CDI_ATUAL) * 100).toFixed(0) : null

            return (
              <View key={inv.id} style={s.invCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={{ color: Colors.accent, fontSize: 11, fontWeight: '700' }}>
                        {TYPE_LABELS[inv.type] || inv.type}
                      </Text>
                      {cdiEquivalent ? (
                        <Text style={{ color: Colors.muted, fontSize: 11 }}>
                          · {cdiEquivalent}% do CDI
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{inv.name}</Text>
                    {inv.institution ? (
                      <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 1 }}>{inv.institution}</Text>
                    ) : null}
                  </View>

                  <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <View style={s.miniActionsRow}>
                      <TouchableOpacity onPress={() => openEdit(inv)} style={s.miniBtnEdit}>
                        <Feather name="edit-2" size={12} color="#f59e0b" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(inv.id, inv.name)} style={s.miniBtnTrash}>
                        <Feather name="trash-2" size={12} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: 'flex-end', marginTop: 4 }}>
                      <Text style={{ color: Colors.muted, fontSize: 10 }}>Saldo atual</Text>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                        {fmt(inv.current_balance || parseFloat(inv.amount))}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 999, height: 4, marginBottom: 10 }}>
                  <View style={{
                    height: 4,
                    width: `${Math.min(Math.abs(yieldPct) * 8, 100)}%`,
                    backgroundColor: yieldColor,
                    borderRadius: 999,
                  }} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ color: Colors.muted, fontSize: 11 }}>
                      Investido: {fmt(parseFloat(inv.amount))}
                    </Text>
                    <Text style={{ color: Colors.muted, fontSize: 10, marginTop: 2 }}>
                      {daysSince === 0
                        ? 'Adicionado hoje'
                        : `${daysSince} dia${daysSince > 1 ? 's' : ''} investido${daysSince > 1 ? 's' : ''}`
                      }
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: yieldColor, fontSize: 13, fontWeight: '700' }}>
                      {isPositive ? '+' : ''}{fmt(yieldAmt)}
                    </Text>
                    <Text style={{ color: yieldColor, fontSize: 11 }}>
                      {fmtPct(yieldPct, 4)}
                    </Text>
                  </View>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>

      {/* Modal Adicionar */}
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
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setForm({ ...form, type: k })}
                      style={[s.chip, form.type === k && s.chipActive]}
                    >
                      <Text style={{ color: form.type === k ? '#000' : Colors.muted, fontSize: 12, fontWeight: '600' }}>
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={s.label}>NOME</Text>
              <TextInput
                style={s.input}
                placeholder="Ex: CDB Banco Inter"
                placeholderTextColor={Colors.muted}
                value={form.name}
                onChangeText={v => setForm({ ...form, name: v })}
              />

              <Text style={s.label}>VALOR (R$)</Text>
              <TextInput
                style={s.input}
                placeholder="1000.00"
                placeholderTextColor={Colors.muted}
                value={form.amount}
                onChangeText={v => setForm({ ...form, amount: v })}
                keyboardType="numeric"
              />

              {TYPES_WITH_RATE.includes(form.type) && (
                <>
                  <Text style={s.label}>TAXA (% DO CDI)</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Ex: 100, 110, 120"
                    placeholderTextColor={Colors.muted}
                    value={form.rate}
                    onChangeText={v => setForm({ ...form, rate: v })}
                    keyboardType="numeric"
                  />
                </>
              )}

              <Text style={s.label}>INSTITUIÇÃO (OPCIONAL)</Text>
              <TextInput
                style={s.input}
                placeholder="Ex: Banco Inter, XP, Nubank..."
                placeholderTextColor={Colors.muted}
                value={form.institution}
                onChangeText={v => setForm({ ...form, institution: v })}
              />

              <Text style={s.label}>DATA DE INÍCIO (AAAA-MM-DD)</Text>
              <TextInput
                style={s.input}
                placeholder="2026-01-01"
                placeholderTextColor={Colors.muted}
                value={form.started_at}
                onChangeText={v => setForm({ ...form, started_at: v })}
              />

              <TouchableOpacity
                style={[s.addBtn, { marginTop: 8, paddingVertical: 14, borderRadius: 12, width: '100%' }]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Adicionar ⛏️</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={editingItem !== null} animationType="fade" transparent>
        <View style={s.modalOverlayCenter}>
          <View style={s.editModalBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Editar Investimento</Text>
              <TouchableOpacity onPress={() => setEditingItem(null)}>
                <Text style={{ color: Colors.muted, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <Text style={s.label}>TIPO DE ATIVO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setEditForm({ ...editForm, type: k })}
                      style={[s.chip, editForm.type === k && s.chipActive, { paddingHorizontal: 10, paddingVertical: 6 }]}
                    >
                      <Text style={{ color: editForm.type === k ? '#000' : Colors.muted, fontSize: 11, fontWeight: '700' }}>
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={s.label}>NOME</Text>
              <TextInput
                style={s.input}
                value={editForm.name}
                onChangeText={v => setEditForm({ ...editForm, name: v })}
                placeholder="Nome do ativo"
                placeholderTextColor={Colors.muted}
              />

              <Text style={s.label}>VALOR INVESTIDO (R$)</Text>
              <TextInput
                style={s.input}
                value={editForm.amount}
                onChangeText={v => setEditForm({ ...editForm, amount: v })}
                keyboardType="numeric"
                placeholder="Valor investido"
                placeholderTextColor={Colors.muted}
              />

              {TYPES_WITH_RATE.includes(editForm.type) && (
                <>
                  <Text style={s.label}>TAXA (% DO CDI)</Text>
                  <TextInput
                    style={s.input}
                    value={editForm.rate}
                    onChangeText={v => setEditForm({ ...editForm, rate: v })}
                    keyboardType="numeric"
                    placeholder="Ex: 100, 110, 120"
                    placeholderTextColor={Colors.muted}
                  />
                </>
              )}

              <Text style={s.label}>INSTITUIÇÃO</Text>
              <TextInput
                style={s.input}
                value={editForm.institution}
                onChangeText={v => setEditForm({ ...editForm, institution: v })}
                placeholder="Ex: Nubank, Inter..."
                placeholderTextColor={Colors.muted}
              />

              <Text style={s.label}>DATA DE INÍCIO</Text>
              <TextInput
                style={s.input}
                value={editForm.started_at}
                onChangeText={v => setEditForm({ ...editForm, started_at: v })}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={Colors.muted}
              />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={[s.cancelBtn, { flex: 1 }]} onPress={() => setEditingItem(null)}>
                <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.addBtn, { flex: 1, paddingVertical: 12 }]} onPress={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? <ActivityIndicator color="#000" size="small" /> : <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWhite: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  logoOrange: { fontSize: 20, fontWeight: '900', color: '#f59e0b', letterSpacing: 0.5 },
  headerSubtitle: { color: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 2 },
  addBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#1e293b', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  totalsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  totalCard: { flex: 1, backgroundColor: '#0d1117', borderRadius: 12, padding: 12 },
  totalLabel: { color: Colors.muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  totalValue: { fontWeight: '700', fontSize: 13 },
  yieldCard: { backgroundColor: '#0d1117', borderRadius: 12, padding: 14, marginBottom: 16 },
  empty: { backgroundColor: '#0d1117', borderRadius: 16, padding: 40, alignItems: 'center' },
  invCard: { backgroundColor: '#0d1117', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  miniActionsRow: { flexDirection: 'row', gap: 4 },
  miniBtnEdit: { width: 26, height: 26, borderRadius: 6, backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center' },
  miniBtnTrash: { width: 26, height: 26, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#0d1117', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  editModalBox: { backgroundColor: '#0d1117', borderRadius: 18, padding: 22, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  label: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 13, color: '#fff', fontSize: 14, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  chipActive: { backgroundColor: Colors.accent },
})