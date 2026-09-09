import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Animated, Easing, Image, Platform, Modal
} from 'react-native'
import { router, useFocusEffect, useNavigation } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { Feather } from '@expo/vector-icons'
import { api, XPEvent } from '../../lib/api'
import { Colors } from '../../constants/colors'
import { getMineralByLevel, MINERALS, INSIGNIAS } from '../../constants/minerals'

interface XPData {
  current: number
  needed: number
  percent: number
  level: number
  total: number
}

function formatNotificationTitle(desc: string) {
  if (desc.includes('DIVERSIFIER_3')) return 'Conquista: Alquimia Financeira (3 tipos de ativos)'
  if (desc.includes('DIVERSIFIER_5')) return 'Conquista: Estrategista (5 tipos de ativos)'
  if (desc.includes('PORTFOLIO_1K')) return 'Conquista: Escudo de Bronze (R$ 1.000 investidos)'
  if (desc.includes('PORTFOLIO_5K')) return 'Conquista: Escudo de Prata (R$ 5.000 investidos)'
  if (desc.includes('PORTFOLIO_10K')) return 'Conquista: Escudo de Ouro (R$ 10.000 investidos)'
  if (desc.includes('FIRST_INVESTMENT')) return 'Conquista: Primeiro Minério'
  if (desc.includes('FIRST_LOGIN') || desc.includes('Primeira forja')) return 'Conquista: Bem-vindo à Forja'
  return desc
}

function Rotating3DBadge({
  name,
  icon,
  glowColor,
  unlocked,
}: {
  name: string
  icon: string
  glowColor: string
  unlocked: boolean
}) {
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!unlocked) return

    let isMounted = true
    const startInfiniteSpin = () => {
      rotateAnim.setValue(0)
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3800,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (finished && isMounted) {
          startInfiniteSpin()
        }
      })
    }

    startInfiniteSpin()

    return () => {
      isMounted = false
      rotateAnim.stopAnimation()
    }
  }, [unlocked, rotateAnim])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  })

  return (
    <View
      style={[
        s.badgeCard3D,
        unlocked
          ? { borderColor: `${glowColor}30`, backgroundColor: `${glowColor}05` }
          : { opacity: 0.35, borderColor: 'rgba(255,255,255,0.03)' },
      ]}
    >
      <View style={s.badgeStage}>
        {unlocked && (
          <View
            style={[
              s.badgeGlowSpot,
              { backgroundColor: glowColor, shadowColor: glowColor, shadowRadius: 16, shadowOpacity: 0.6 },
            ]}
          />
        )}
        <Animated.View
          style={[
            s.badgeIconWrap,
            unlocked && {
              transform: [{ perspective: 600 }, { rotateY: spin }],
            },
          ]}
        >
          <Text style={{ fontSize: 36 }}>{icon}</Text>
        </Animated.View>
      </View>

      <Text
        style={[
          s.badgeTitle3D,
          { color: unlocked ? '#fff' : Colors.muted, fontWeight: unlocked ? '800' : '600' },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  )
}

function MineralXPBar({ xp }: { xp: XPData }) {
  const anim = useState(new Animated.Value(0))[0]
  const mineral = getMineralByLevel(xp.level)

  useEffect(() => {
    anim.setValue(0)
    Animated.timing(anim, {
      toValue: xp.percent,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [xp.level, xp.percent, anim])

  const nextMineral = getMineralByLevel(xp.level + 1)
  const isNewMineral = nextMineral.name !== mineral.name

  return (
    <View style={[xs.container, { borderColor: `${mineral.color}35`, borderWidth: 1 }]}>
      <View style={[xs.badge, { backgroundColor: `${mineral.color}15` }]}>
        <Text style={{ fontSize: 32 }}>{mineral.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mineral.color, fontWeight: '900', fontSize: 17 }}>{mineral.name}</Text>
          <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 2 }}>{mineral.description}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginVertical: 12 }}>
        <View>
          <Text style={{ color: Colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' }}>NÍVEL ATUAL</Text>
          <Text style={{ color: mineral.color, fontSize: 44, fontWeight: '900', lineHeight: 48 }}>
            {xp.level}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: Colors.muted, fontSize: 10, fontWeight: '700' }}>XP TOTAL</Text>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 24 }}>
            {xp.total.toLocaleString()}
          </Text>
          <Text style={{ color: Colors.muted, fontSize: 11 }}>
            {xp.current} / {xp.needed} XP
          </Text>
        </View>
      </View>

      <View style={xs.track}>
        <Animated.View style={[xs.fill, {
          width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          backgroundColor: mineral.color,
        }]} />
        {[25, 50, 75].map((m) => (
          <View key={m} style={[xs.marker, { left: `${m}%` }]} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ color: Colors.muted, fontSize: 11 }}>Nível {xp.level}</Text>
        <Text style={{ color: mineral.color, fontSize: 11, fontWeight: '800' }}>{xp.percent}%</Text>
        <Text style={{ color: Colors.muted, fontSize: 11 }}>Nível {xp.level + 1}</Text>
      </View>

      <Text style={{ color: Colors.muted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
        Faltam <Text style={{ color: mineral.color, fontWeight: '700' }}>{xp.needed - xp.current} XP</Text> para evoluir
      </Text>

      {isNewMineral && (
        <View style={[xs.nextMineral, { borderColor: `${nextMineral.color}25` }]}>
          <Text style={{ color: Colors.muted, fontSize: 11 }}>Próxima evolução: </Text>
          <Text style={{ fontSize: 15 }}>{nextMineral.emoji}</Text>
          <Text style={{ color: nextMineral.color, fontWeight: '800', fontSize: 12 }}>
            {' '}{nextMineral.name}
          </Text>
          <Text style={{ color: Colors.muted, fontSize: 11 }}> no nível {nextMineral.minLevel}</Text>
        </View>
      )}
    </View>
  )
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ProfileScreen() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getProfile>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [notificationsList, setNotificationsList] = useState<XPEvent[]>([])

  const [currentTab, setCurrentTab] = useState<'ranks' | 'achievements' | 'badges'>('ranks')
  const [filterState, setFilterState] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)

  const navigation = useNavigation()

  const load = useCallback(async () => {
    try {
      const result = await api.getProfile()
      setData(result)

      if (result?.user?.id) {
        const savedBase64 = await AsyncStorage.getItem(`user_avatar_base64_${result.user.id}`)
        if (savedBase64) setAvatarUri(savedBase64)

        const deletedRaw = await AsyncStorage.getItem(`deleted_notifs_${result.user.id}`)
        const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : [])

        const now = Date.now()
        const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000

        const activeNotifs = (result.recentEvents || [])
          .filter((ev) => !deletedIds.has(ev.id))
          .filter((ev) => now - new Date(ev.created_at).getTime() <= fourteenDaysMs)
          .slice(0, 15)

        setNotificationsList(activeNotifs)
      }
    } catch {
      if (Platform.OS === 'web') {
        window.location.href = '/'
      } else {
        const rootNav = navigation.getParent()
        if (rootNav) {
          rootNav.reset({ index: 0, routes: [{ name: 'index' }] })
        } else {
          router.replace('/' as any)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [navigation])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const pickImage = async () => {
    if (!data?.user?.id) return

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Acesso à galeria é necessário para escolher uma foto de perfil.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      let imageString = ''

      if (asset.base64) {
        imageString = `data:image/jpeg;base64,${asset.base64}`
      } else {
        imageString = asset.uri
      }

      setAvatarUri(imageString)
      await AsyncStorage.setItem(`user_avatar_base64_${data.user.id}`, imageString)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (!data?.user?.id) return
    const storageKey = `deleted_notifs_${data.user.id}`
    const raw = await AsyncStorage.getItem(storageKey)
    const setIds = new Set<string>(raw ? JSON.parse(raw) : [])
    setIds.add(id)
    await AsyncStorage.setItem(storageKey, JSON.stringify(Array.from(setIds)))

    setNotificationsList((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAllNotifications = async () => {
    if (!data?.user?.id) return
    const storageKey = `deleted_notifs_${data.user.id}`
    const raw = await AsyncStorage.getItem(storageKey)
    const setIds = new Set<string>(raw ? JSON.parse(raw) : [])
    notificationsList.forEach((n) => setIds.add(n.id))
    await AsyncStorage.setItem(storageKey, JSON.stringify(Array.from(setIds)))

    setNotificationsList([])
  }

  function handleLogout() {
    const executeLogout = async () => {
      await AsyncStorage.multiRemove(['ore_token', 'ore_user'])
      if (Platform.OS === 'web') {
        window.location.href = '/'
      } else {
        const rootNav = navigation.getParent()
        if (rootNav) {
          rootNav.reset({ index: 0, routes: [{ name: 'index' }] })
        } else {
          router.replace('/' as any)
        }
      }
    }

    if (Platform.OS === 'web') {
      if (window.confirm('Sair da conta\n\nVocê realmente quer sair?')) {
        executeLogout()
      }
    } else {
      Alert.alert('Sair da conta', 'Você realmente quer sair?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', style: 'destructive', onPress: executeLogout },
      ])
    }
  }

  const { user, xp, stats, achievements } = data || {}
  const mineral = getMineralByLevel(xp?.level || 1)
  const yieldTotal = (stats?.totalBalance || 0) - (stats?.totalInvested || 0)

  const userUnlockedInsignias = useMemo(() => {
    const unlocked = new Set<string>()
    unlocked.add('SHIELD_IRON')

    if ((stats?.totalInvested || 0) >= 1000) unlocked.add('SHIELD_BRONZE')
    if ((stats?.totalInvested || 0) >= 5000) unlocked.add('SHIELD_SILVER')
    if ((stats?.totalInvested || 0) >= 10000) unlocked.add('SHIELD_GOLD')
    if ((stats?.totalInvested || 0) >= 50000) unlocked.add('SHIELD_DIAMOND')
    if ((stats?.totalInvested || 0) >= 100000) unlocked.add('PICKAXE_LEGEND')

    if ((stats?.uniqueTypes || 0) >= 3) unlocked.add('SWORD_WARRIOR')
    if ((stats?.uniqueTypes || 0) >= 5) unlocked.add('CROWN_STRATEGIST')
    if ((stats?.totalInvestments || 0) >= 5) unlocked.add('FIRE_STREAK')
    if ((stats?.maxDaysActive || 0) >= 30) unlocked.add('MOUNTAIN_VETERAN')

    if ((xp?.level || 1) >= 20) unlocked.add('STAR_LEGEND')

    if (Array.isArray(achievements)) {
      achievements.forEach((achKey) => {
        if (INSIGNIAS.some((i) => i.key === achKey)) unlocked.add(achKey)
      })
    }

    if (unlocked.size >= 5) unlocked.add('GEM_MASTER')

    return unlocked
  }, [stats, xp?.level, achievements])

  const allMedalsList = useMemo(() => {
    const rankMedals = MINERALS.map((m) => ({
      id: `rank_${m.name}`,
      name: `Medalha de ${m.name}`,
      icon: m.emoji,
      glowColor: m.color,
      unlocked: (xp?.level || 1) >= m.minLevel,
    }))

    const achievementMedals = INSIGNIAS.map((ins) => ({
      id: `ins_${ins.key}`,
      name: `Ordem ${ins.label}`,
      icon: ins.icon,
      glowColor: ins.color,
      unlocked: userUnlockedInsignias.has(ins.key),
    }))

    return [...rankMedals, ...achievementMedals]
  }, [xp?.level, userUnlockedInsignias])

  const filteredMinerals = useMemo(() => {
    return MINERALS.filter((m) => {
      const isUnlocked = (xp?.level || 1) >= m.minLevel
      if (filterState === 'unlocked') return isUnlocked
      if (filterState === 'locked') return !isUnlocked
      return true
    })
  }, [xp?.level, filterState])

  const filteredInsignias = useMemo(() => {
    return INSIGNIAS.filter((ins) => {
      const isUnlocked = userUnlockedInsignias.has(ins.key)
      if (filterState === 'unlocked') return isUnlocked
      if (filterState === 'locked') return !isUnlocked
      return true
    })
  }, [userUnlockedInsignias, filterState])

  const filteredMedals = useMemo(() => {
    return allMedalsList.filter((med) => {
      if (filterState === 'unlocked') return med.unlocked
      if (filterState === 'locked') return !med.unlocked
      return true
    })
  }, [allMedalsList, filterState])

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    )
  }

  return (
    <View style={s.container}>
      {/* Header Padronizado */}
      <View style={s.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.logoWhite}>ORE</Text>
            <Text style={s.logoOrange}>FORGE</Text>
          </View>
          <Text style={s.headerSubtitle}>PERFIL</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowNotificationsModal(true)} style={s.iconBtn}>
            <Feather name="bell" size={20} color="#f59e0b" />
            {notificationsList.length > 0 && <View style={s.bellDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={s.iconBtn}>
            <Feather name="settings" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={s.iconBtn}>
            <Feather name="log-out" size={20} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
        {/* Card do Usuário */}
        <View style={[s.avatarCard, { borderColor: `${mineral.color}35` }]}>
          <TouchableOpacity onPress={pickImage} style={s.avatarWrapper}>
            <View style={[s.avatarRing, { borderColor: mineral.color }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatarImage} />
              ) : (
                <Text style={{ fontSize: 36 }}>{mineral.emoji}</Text>
              )}
            </View>
            <View style={s.cameraBadge}>
              <Feather name="camera" size={12} color="#000" />
            </View>
          </TouchableOpacity>

          <Text style={s.userName}>{user?.name}</Text>
          <Text style={{ color: Colors.muted, fontSize: 13 }}>{user?.email}</Text>

          <View style={[s.mineralTag, { backgroundColor: `${mineral.color}15`, borderColor: `${mineral.color}40` }]}>
            <Text style={{ fontSize: 16 }}>{mineral.emoji}</Text>
            <Text style={{ color: mineral.color, fontWeight: '900', fontSize: 14 }}>
              {mineral.name} · Nível {xp?.level}
            </Text>
          </View>
          <Text style={{ color: Colors.muted, fontSize: 11, marginTop: 8 }}>
            Minerador desde{' '}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              : 'setembro de 2026'}
          </Text>
        </View>

        {/* Barra de XP */}
        {xp && <MineralXPBar xp={xp} />}

        {/* Hub Seletor */}
        <View style={s.hubTabContainer}>
          {[
            { key: 'ranks', label: 'Ranks', icon: 'layers' },
            { key: 'achievements', label: 'Conquistas', icon: 'award' },
            { key: 'badges', label: 'Medalhas', icon: 'shield' },
          ].map((tab) => {
            const isActive = currentTab === tab.key
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.hubTabBtn, isActive && s.hubTabBtnActive]}
                onPress={() => setCurrentTab(tab.key as any)}
              >
                <Feather
                  name={tab.icon as any}
                  size={14}
                  color={isActive ? '#f59e0b' : '#64748b'}
                />
                <Text style={[s.hubTabBtnText, isActive && s.hubTabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Filtros */}
        <View style={s.filterRow}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'unlocked', label: 'Desbloqueados' },
            { id: 'locked', label: 'Bloqueados' },
          ].map((f) => {
            const active = filterState === f.id
            return (
              <TouchableOpacity
                key={f.id}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setFilterState(f.id as any)}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* 1. RANKS */}
        {currentTab === 'ranks' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={s.cardTitle}>Progressão de Minerais</Text>
              <Text style={{ color: Colors.accent, fontSize: 12, fontWeight: '700' }}>
                {MINERALS.filter((m) => (xp?.level || 1) >= m.minLevel).length} / {MINERALS.length} Desbloqueados
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {filteredMinerals.map((m) => {
                const isUnlocked = (xp?.level || 1) >= m.minLevel
                const isCurrent = mineral.name === m.name
                return (
                  <View
                    key={m.name}
                    style={[
                      s.rowItem,
                      isCurrent && { backgroundColor: `${m.color}15`, borderColor: `${m.color}40`, borderWidth: 1 },
                    ]}
                  >
                    <Text style={{ fontSize: 24, opacity: isUnlocked ? 1 : 0.25 }}>{m.emoji}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: isUnlocked ? m.color : Colors.muted, fontWeight: '700', fontSize: 14 }}>
                        {m.name}
                        {isCurrent && <Text style={{ fontSize: 11, fontWeight: '400' }}> ← atual</Text>}
                      </Text>
                      <Text style={{ color: Colors.muted, fontSize: 11 }}>Requer Nível {m.minLevel}+</Text>
                    </View>
                    {isUnlocked ? (
                      <Feather name="check-circle" size={16} color={m.color} />
                    ) : (
                      <Feather name="lock" size={14} color="#334155" />
                    )}
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 2. CONQUISTAS */}
        {currentTab === 'achievements' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={s.cardTitle}>Conquistas da Forja</Text>
              <Text style={{ color: Colors.accent, fontSize: 12, fontWeight: '700' }}>
                {userUnlockedInsignias.size} / {INSIGNIAS.length} Concluídas
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {filteredInsignias.map((ins) => {
                const isUnlocked = userUnlockedInsignias.has(ins.key)
                return (
                  <View
                    key={ins.key}
                    style={[
                      s.rowItem,
                      isUnlocked && { backgroundColor: `${ins.color}10`, borderColor: `${ins.color}35`, borderWidth: 1 },
                    ]}
                  >
                    <Text style={{ fontSize: 24, opacity: isUnlocked ? 1 : 0.25 }}>{ins.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: isUnlocked ? '#fff' : Colors.muted, fontWeight: '700', fontSize: 14 }}>
                        {ins.label}
                      </Text>
                      <Text style={{ color: Colors.muted, fontSize: 11 }}>{ins.requirement || ins.desc}</Text>
                    </View>
                    {isUnlocked ? (
                      <Feather name="check-circle" size={16} color={ins.color} />
                    ) : (
                      <Feather name="lock" size={14} color="#334155" />
                    )}
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 3. MURAL 3D */}
        {currentTab === 'badges' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={s.cardTitle}>Mural de Medalhas 3D</Text>
              <Text style={{ color: Colors.accent, fontSize: 12, fontWeight: '700' }}>
                {allMedalsList.filter((med) => med.unlocked).length} / {allMedalsList.length} Conquistadas
              </Text>
            </View>
            <View style={s.gridContainer}>
              {filteredMedals.map((med) => (
                <Rotating3DBadge
                  key={med.id}
                  name={med.name}
                  icon={med.icon}
                  glowColor={med.glowColor}
                  unlocked={med.unlocked}
                />
              ))}
            </View>
          </View>
        )}

        {/* ESTATÍSTICAS */}
        <View style={[s.card, { marginTop: 6 }]}>
          <Text style={s.cardTitle}>Estatísticas do Portfólio</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {[
              ['Portfólio atual', fmt(stats?.totalBalance || 0), '#fff'],
              ['Total investido', fmt(stats?.totalInvested || 0), '#fff'],
              ['Rendimento total', fmt(yieldTotal), yieldTotal >= 0 ? Colors.success : Colors.error],
              ['Investimentos', String(stats?.totalInvestments || 0), Colors.accent],
              ['Tipos de ativo', String(stats?.uniqueTypes || 0), '#a855f7'],
              ['Dias mais longo', `${Math.floor(stats?.maxDaysActive || 0)} dias`, '#10b981'],
            ].map(([label, value, color]) => (
              <View key={label} style={s.statRow}>
                <Text style={{ color: Colors.muted, fontSize: 13 }}>{label}</Text>
                <Text style={{ color, fontWeight: '700', fontSize: 13 }}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* COMO GANHAR XP */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Como ganhar XP</Text>
          <View style={{ gap: 6, marginTop: 8 }}>
            {[
              { icon: 'plus-circle' as const, action: 'Adicionar investimento', xp: '+30 a +80 XP' },
              { icon: 'trending-up' as const, action: 'Ativo mantido', xp: '+1 XP/dia' },
              { icon: 'edit-2' as const, action: 'Editar investimento', xp: '+10 XP' },
            ].map(({ icon, action, xp: x }) => (
              <View key={action} style={s.statRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name={icon} size={15} color="#94a3b8" />
                  <Text style={{ color: '#fff', fontSize: 13 }}>{action}</Text>
                </View>
                <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: 13 }}>{x}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Notificações */}
      <Modal visible={showNotificationsModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="bell" size={18} color="#f59e0b" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Notificações</Text>
              </View>
              {notificationsList.length > 0 && (
                <TouchableOpacity onPress={handleClearAllNotifications} style={s.clearAllBtn}>
                  <Text style={s.clearAllBtnText}>Limpar tudo</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {notificationsList.length > 0 ? (
                notificationsList.map((ev) => (
                  <View key={ev.id} style={s.notificationItem}>
                    <View style={s.notifIconWrap}>
                      <Feather name="zap" size={14} color="#f59e0b" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                        {formatNotificationTitle(ev.description)}
                      </Text>
                      <Text style={{ color: Colors.muted, fontSize: 10, marginTop: 2 }}>
                        {new Date(ev.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={s.xpBadge}>
                      <Text style={{ color: Colors.accent, fontWeight: '900', fontSize: 11 }}>
                        +{ev.xp_gained}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteNotification(ev.id)}
                      style={s.notifTrashBtn}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={{ padding: 28, alignItems: 'center' }}>
                  <Feather name="inbox" size={32} color="#475569" />
                  <Text style={{ color: Colors.muted, fontSize: 13, marginTop: 8 }}>Nenhuma notificação.</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setShowNotificationsModal(false)}>
              <Text style={s.modalCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
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
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  avatarCard: { backgroundColor: '#0d1117', borderRadius: 20, borderWidth: 1, padding: 20, alignItems: 'center', marginBottom: 14 },
  avatarWrapper: { position: 'relative' },
  avatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: Colors.accent, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  userName: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 10, textAlign: 'center' },
  mineralTag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 10 },
  hubTabContainer: { flexDirection: 'row', backgroundColor: '#0d1117', borderRadius: 14, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  hubTabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  hubTabBtnActive: { backgroundColor: '#161b22', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  hubTabBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  hubTabBtnTextActive: { color: '#f59e0b' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#0d1117', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b' },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  filterChipTextActive: { color: '#f59e0b' },
  card: { backgroundColor: '#0d1117', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rowItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  xpBadge: { backgroundColor: `${Colors.accent}18`, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  badgeCard3D: { width: '31%', borderRadius: 14, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  badgeStage: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative' },
  badgeGlowSpot: { position: 'absolute', width: 38, height: 38, borderRadius: 19, opacity: 0.35 },
  badgeIconWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  badgeTitle3D: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#0d1117', borderRadius: 20, padding: 20, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  clearAllBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  clearAllBtnText: { color: '#ef4444', fontSize: 11, fontWeight: '800' },
  notificationItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  notifIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center' },
  notifTrashBtn: { padding: 6 },
  modalCloseBtn: { backgroundColor: '#f59e0b', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  modalCloseBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
})

const xs = StyleSheet.create({
  container: { backgroundColor: '#0d1117', borderRadius: 16, padding: 18, marginBottom: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 10 },
  track: { height: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden', position: 'relative' },
  fill: { height: '100%', borderRadius: 999 },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  nextMineral: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, padding: 10, borderRadius: 8, borderWidth: 1, justifyContent: 'center', flexWrap: 'wrap' },
})