import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

// Notícias relevantes do dia a dia da economia e finanças
const MARKET_NEWS = [
  {
    category: 'MACRO',
    title: 'Boletim Focus reduz previsão da inflação para o ano e eleva projeções do PIB',
    source: 'Banco Central do Brasil',
    time: 'Hoje · 11:07',
    url: 'https://www.bcb.gov.br',
  },
  {
    category: 'BOLSA',
    title: 'Ibovespa sobe impulsionado pelo retorno do fluxo de capital estrangeiro na B3',
    source: 'B3 Bora Investir',
    time: 'Hoje · 14:20',
    url: 'https://borainvestir.b3.com.br',
  },
  {
    category: 'RENDA FIXA',
    title: 'Copom reúne comitê para definir rumo da taxa Selic; mercado projeta estabilidade',
    source: 'InfoMoney',
    time: 'Hoje · 09:45',
    url: 'https://www.infomoney.com.br',
  },
  {
    category: 'TESOURO',
    title: 'Tesouro Direto: papéis atrelados ao IPCA atingem máximas de remuneração real',
    source: 'Tesouro Nacional',
    time: 'Ontem · 18:30',
    url: 'https://www.tesourodireto.com.br',
  },
]

export default function MarketNewsScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('TODOS')

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 600)
  }

  const filteredNews = selectedTag === 'TODOS'
    ? MARKET_NEWS
    : MARKET_NEWS.filter((n) => n.category === selectedTag)

  return (
    <View style={s.container}>
      {/* Header Padronizado */}
      <View style={s.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.logoWhite}>ORE</Text>
            <Text style={s.logoOrange}>FORGE</Text>
          </View>
          <Text style={s.headerSubtitle}>NOTÍCIAS DE MERCADO</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Painel de Indicadores Rápidos */}
        <View style={s.sectionHeader}>
          <Text style={{ fontSize: 16 }}>📊</Text>
          <Text style={s.sectionTitle}>Panorama Econômico</Text>
        </View>

        <View style={s.indicatorsRow}>
          <View style={s.indicatorCard}>
            <Text style={s.indicatorLabel}>SELIC META</Text>
            <Text style={s.indicatorValue}>13.02%</Text>
            <Text style={s.indicatorSub}>a.a.</Text>
          </View>

          <View style={s.indicatorCard}>
            <Text style={s.indicatorLabel}>CDI</Text>
            <Text style={s.indicatorValue}>13.02%</Text>
            <Text style={s.indicatorSub}>a.a.</Text>
          </View>

          <View style={s.indicatorCard}>
            <Text style={s.indicatorLabel}>IPCA (12M)</Text>
            <Text style={s.indicatorValue}>4.44%</Text>
            <Text style={s.indicatorSub}>acumulado</Text>
          </View>
        </View>

        {/* Filtro por Categorias de Notícias */}
        <View style={s.filterRow}>
          {['TODOS', 'BOLSA', 'RENDA FIXA', 'MACRO'].map((tag) => {
            const active = selectedTag === tag
            return (
              <TouchableOpacity
                key={tag}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{tag}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Lista de Notícias */}
        <View style={{ gap: 12 }}>
          {filteredNews.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={s.newsCard}
              activeOpacity={0.75}
              onPress={() => Linking.openURL(item.url)}
            >
              <View style={s.newsHeader}>
                <View style={s.categoryBadge}>
                  <Text style={s.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={s.newsTime}>{item.time}</Text>
              </View>

              <Text style={s.newsTitle}>{item.title}</Text>

              <View style={s.newsFooter}>
                <Text style={s.newsSource}>{item.source}</Text>
                <Feather name="arrow-up-right" size={14} color="#f59e0b" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  indicatorsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  indicatorCard: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  indicatorLabel: { color: Colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  indicatorValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  indicatorSub: { color: '#64748b', fontSize: 10, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
  },
  filterChipText: { color: '#64748b', fontSize: 10, fontWeight: '800' },
  filterChipTextActive: { color: '#f59e0b' },
  newsCard: {
    backgroundColor: '#0d1117',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: { color: '#f59e0b', fontSize: 9, fontWeight: '800' },
  newsTime: { color: '#64748b', fontSize: 11 },
  newsTitle: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 10 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newsSource: { color: '#64748b', fontSize: 12, fontWeight: '500' },
})