import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { api, InvestmentItem } from '../../lib/api'
import { Colors } from '../../constants/colors'

const HIGH_MOVERS = [
  { ticker: 'PETR4', name: 'Petrobras PN', price: 'R$ 48,45', change: '+0,75%', positive: true },
  { ticker: 'BPAC11', name: 'BTG Pactual', price: 'R$ 59,00', change: '+3,24%', positive: true },
  { ticker: 'BOAC34', name: 'BofA Corp', price: 'R$ 80,16', change: '+1,17%', positive: true },
]

const LOW_MOVERS = [
  { ticker: 'ITUB4', name: 'Itaú Unibanco', price: 'R$ 41,67', change: '-1,84%', positive: false },
  { ticker: 'BBAS3', name: 'Banco do Brasil', price: 'R$ 22,24', change: '-1,59%', positive: false },
  { ticker: 'WEGE3', name: 'WEG S.A.', price: 'R$ 52,06', change: '-1,12%', positive: false },
]

export default function AnalysisScreen() {
  const [activeTab, setActiveTab] = useState<'fixed' | 'stock' | 'wallet'>('stock')
  const [investments, setInvestments] = useState<InvestmentItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getInvestments()
      if (res?.investments) {
        setInvestments(res.investments)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const totalPortfolio = investments.reduce((sum, i) => sum + (i.current_balance || Number(i.amount) || 0), 0)

  // Cálculo de alocação por categoria
  const allocation = investments.reduce((acc: Record<string, number>, inv) => {
    const val = inv.current_balance || Number(inv.amount) || 0
    acc[inv.type] = (acc[inv.type] || 0) + val
    return acc
  }, {})

  return (
    <View style={s.container}>
      {/* Header Padronizado */}
      <View style={s.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.logoWhite}>ORE</Text>
            <Text style={s.logoOrange}>FORGE</Text>
          </View>
          <Text style={s.headerSubtitle}>ANÁLISE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Seletor de Categorias */}
        <View style={s.tabContainer}>
          {[
            { id: 'stock', label: 'Bolsa & Mercado' },
            { id: 'fixed', label: 'Renda Fixa' },
            { id: 'wallet', label: 'Minha Carteira' },
          ].map((tab) => {
            const active = activeTab === tab.id
            return (
              <TouchableOpacity
                key={tab.id}
                style={[s.tabBtn, active && s.tabBtnActive]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* 1. ABA BOLSA & MERCADO (Com Altas e Baixas) */}
        {activeTab === 'stock' && (
          <View style={{ gap: 14 }}>
            {/* Termômetro dos Principais Índices */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Índices do Dia</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <View style={s.metricBox}>
                  <Text style={s.metricBoxLabel}>IBOVESPA</Text>
                  <Text style={s.metricBoxValue}>185.629</Text>
                  <Text style={[s.metricBoxChange, { color: Colors.error }]}>-0.93%</Text>
                </View>

                <View style={s.metricBox}>
                  <Text style={s.metricBoxLabel}>DÓLAR PTAX</Text>
                  <Text style={s.metricBoxValue}>R$ 5,10</Text>
                  <Text style={[s.metricBoxChange, { color: Colors.success }]}>+0.24%</Text>
                </View>

                <View style={s.metricBox}>
                  <Text style={s.metricBoxLabel}>IFIX (FIIs)</Text>
                  <Text style={s.metricBoxValue}>3.342</Text>
                  <Text style={[s.metricBoxChange, { color: Colors.success }]}>+0.15%</Text>
                </View>
              </View>
            </View>

            {/* Ações em Alta */}
            <View style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Feather name="trending-up" size={16} color={Colors.success} />
                <Text style={s.cardTitle}>Maiores Altas (B3)</Text>
              </View>
              <View style={{ gap: 8 }}>
                {HIGH_MOVERS.map((stock) => (
                  <View key={stock.ticker} style={s.stockRow}>
                    <View>
                      <Text style={s.stockTicker}>{stock.ticker}</Text>
                      <Text style={s.stockName}>{stock.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.stockPrice}>{stock.price}</Text>
                      <Text style={[s.stockChange, { color: Colors.success }]}>{stock.change}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Ações em Baixa */}
            <View style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Feather name="trending-down" size={16} color={Colors.error} />
                <Text style={s.cardTitle}>Maiores Baixas (B3)</Text>
              </View>
              <View style={{ gap: 8 }}>
                {LOW_MOVERS.map((stock) => (
                  <View key={stock.ticker} style={s.stockRow}>
                    <View>
                      <Text style={s.stockTicker}>{stock.ticker}</Text>
                      <Text style={s.stockName}>{stock.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.stockPrice}>{stock.price}</Text>
                      <Text style={[s.stockChange, { color: Colors.error }]}>{stock.change}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 2. ABA RENDA FIXA */}
        {activeTab === 'fixed' && (
          <View style={{ gap: 14 }}>
            <Text style={s.sourceNote}>Taxas Oficiais · Banco Central do Brasil</Text>

            <View style={[s.metricCard, { borderLeftColor: '#38bdf8' }]}>
              <Text style={s.metricLabel}>TAXA SELIC META</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
                <Text style={s.metricMain}>13.02%</Text>
                <Text style={s.metricSub}>ao ano</Text>
              </View>
              <Text style={s.metricDesc}>
                Taxa de juros básica da economia brasileira. Baliza títulos do Tesouro Selic e remuneração da poupança.
              </Text>
            </View>

            <View style={[s.metricCard, { borderLeftColor: '#f59e0b' }]}>
              <Text style={s.metricLabel}>CDI ANUAL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
                <Text style={s.metricMain}>13.02%</Text>
                <Text style={s.metricSub}>ao ano (~1,02% ao mês)</Text>
              </View>
              <Text style={s.metricDesc}>
                Principal indexador da renda fixa privada (CDBs, LCIs, LCAs). Rende 100% da Selic overnight.
              </Text>
            </View>

            <View style={[s.metricCard, { borderLeftColor: '#10b981' }]}>
              <Text style={s.metricLabel}>IPCA (INFLAÇÃO ACUMULADA)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
                <Text style={s.metricMain}>4.44%</Text>
                <Text style={s.metricSub}>últimos 12 meses</Text>
              </View>
              <Text style={s.metricDesc}>
                Juro real atual da renda fixa no Brasil gira em torno de +8,58% acima da inflação oficial.
              </Text>
            </View>
          </View>
        )}

        {/* 3. ABA MINHA CARTEIRA */}
        {activeTab === 'wallet' && (
          <View style={{ gap: 14 }}>
            {loading ? (
              <ActivityIndicator color={Colors.accent} size="large" style={{ marginVertical: 32 }} />
            ) : totalPortfolio === 0 ? (
              <View style={s.card}>
                <Text style={{ color: Colors.muted, textAlign: 'center', padding: 24 }}>
                  Nenhum investimento registrado ainda para calcular a diversificação da sua carteira.
                </Text>
              </View>
            ) : (
              <>
                <View style={s.card}>
                  <Text style={s.cardTitle}>Alocação por Classe de Ativo</Text>
                  <View style={{ gap: 10, marginTop: 12 }}>
                    {Object.entries(allocation).map(([type, value]) => {
                      const pct = (value / totalPortfolio) * 100
                      return (
                        <View key={type}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{type}</Text>
                            <Text style={{ color: Colors.accent, fontSize: 13, fontWeight: '800' }}>
                              {pct.toFixed(1)}% (R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                            </Text>
                          </View>
                          <View style={s.miniProgressBar}>
                            <View style={[s.miniProgressFill, { width: `${pct}%`, backgroundColor: Colors.accent }]} />
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>Recomendação da Forja</Text>
                  <Text style={{ color: Colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                    Manter investimentos divididos entre Renda Fixa (para reserva) e Renda Variável/FIIs protege contra a inflação e maximiza o ganho passivo de XP na sua forja.
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
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
  tabContainer: { flexDirection: 'row', backgroundColor: '#0d1117', borderRadius: 12, padding: 4, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#f59e0b' },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#000', fontWeight: '900' },
  card: { backgroundColor: '#0d1117', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  metricBox: { flex: 1, backgroundColor: '#161b22', borderRadius: 10, padding: 10, alignItems: 'center' },
  metricBoxLabel: { color: Colors.muted, fontSize: 9, fontWeight: '800', marginBottom: 2 },
  metricBoxValue: { color: '#fff', fontSize: 14, fontWeight: '900' },
  metricBoxChange: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  stockTicker: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stockName: { color: Colors.muted, fontSize: 11 },
  stockPrice: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stockChange: { fontSize: 11, fontWeight: '800' },
  sourceNote: { color: '#64748b', fontSize: 11, textAlign: 'center', marginBottom: 4 },
  metricCard: { backgroundColor: '#0d1117', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderLeftWidth: 4 },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  metricMain: { color: '#fff', fontSize: 26, fontWeight: '900' },
  metricSub: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  metricDesc: { color: '#94a3b8', fontSize: 12, lineHeight: 16, marginTop: 4 },
  miniProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 3 },
})