import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../constants/colors'
import { api } from '../lib/api'

function AmberSwitch({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        sw.track,
        {
          backgroundColor: value ? 'rgba(245, 158, 11, 0.35)' : '#1e293b',
          borderColor: value ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
        },
      ]}
    >
      <View
        style={[
          sw.thumb,
          {
            backgroundColor: value ? '#f59e0b' : '#64748b',
            alignSelf: value ? 'flex-end' : 'flex-start',
          },
        ]}
      />
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const [xpNotif, setXpNotif] = useState(true)
  const [achieveNotif, setAchieveNotif] = useState(true)
  const [showValues, setShowValues] = useState(true)

  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'rate' | 'edit_name' | 'edit_email' | 'edit_password' | null>(null)
  const [rating, setRating] = useState(5)

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingUpdate, setLoadingUpdate] = useState(false)

  useEffect(() => {
    async function loadPreferences() {
      try {
        const storedXp = await AsyncStorage.getItem('pref_xp_notif')
        const storedAchieve = await AsyncStorage.getItem('pref_achieve_notif')
        const storedShowValues = await AsyncStorage.getItem('pref_show_values')

        if (storedXp !== null) setXpNotif(storedXp === 'true')
        if (storedAchieve !== null) setAchieveNotif(storedAchieve === 'true')
        if (storedShowValues !== null) setShowValues(storedShowValues === 'true')

        const storedUser = await AsyncStorage.getItem('ore_user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          if (parsed.name) setNewName(parsed.name)
          if (parsed.email) setNewEmail(parsed.email)
        }
      } catch (e) {
        console.error('Erro ao carregar preferências:', e)
      }
    }
    loadPreferences()
  }, [])

  const toggleXpNotif = async (value: boolean) => {
    setXpNotif(value)
    await AsyncStorage.setItem('pref_xp_notif', String(value))
  }

  const toggleAchieveNotif = async (value: boolean) => {
    setAchieveNotif(value)
    await AsyncStorage.setItem('pref_achieve_notif', String(value))
  }

  const toggleShowValues = async (value: boolean) => {
    setShowValues(value)
    await AsyncStorage.setItem('pref_show_values', String(value))
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      alert('Por favor, informe um nome válido.')
      return
    }
    setLoadingUpdate(true)
    try {
      await api.updateProfile({ name: newName.trim() })

      const storedUser = await AsyncStorage.getItem('ore_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        parsed.name = newName.trim()
        await AsyncStorage.setItem('ore_user', JSON.stringify(parsed))
      }

      alert('Nome atualizado com sucesso!')
      setActiveModal(null)
    } catch (err: any) {
      alert(err?.message || 'Falha ao atualizar o nome.')
    } finally {
      setLoadingUpdate(false)
    }
  }

  const handleSaveEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('Por favor, informe um e-mail válido.')
      return
    }
    setLoadingUpdate(true)
    try {
      await api.updateProfile({ email: newEmail.trim() })

      const storedUser = await AsyncStorage.getItem('ore_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        parsed.email = newEmail.trim()
        await AsyncStorage.setItem('ore_user', JSON.stringify(parsed))
      }

      alert('E-mail atualizado com sucesso!')
      setActiveModal(null)
    } catch (err: any) {
      alert(err?.message || 'Falha ao atualizar o e-mail.')
    } finally {
      setLoadingUpdate(false)
    }
  }

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.')
      return
    }
    setLoadingUpdate(true)
    try {
      await api.updateProfile({ password: newPassword })
      alert('Senha alterada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
      setActiveModal(null)
    } catch (err: any) {
      alert(err?.message || 'Falha ao atualizar a senha.')
    } finally {
      setLoadingUpdate(false)
    }
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm()
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', style: 'destructive', onPress: onConfirm },
      ])
    }
  }

  const handleLogout = () => {
    showConfirm('Sair da conta', 'Você realmente quer sair?', async () => {
      await AsyncStorage.multiRemove(['ore_token', 'ore_user'])
      if (Platform.OS === 'web') {
        window.location.href = '/'
      } else {
        router.replace('/' as any)
      }
    })
  }

  const handleDeleteAccount = () => {
    showConfirm('Excluir Conta', 'Você realmente quer excluir sua conta?', () => {
      showConfirm(
        'Atenção!',
        'Você tem certeza? Todos os seus dados serão apagados permanentemente.',
        async () => {
          try {
            const token = await AsyncStorage.getItem('ore_token')
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://oreforge-z2gx.onrender.com'

            if (token) {
              await fetch(`${API_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              })
            }
          } catch (e) {
            console.error('Erro na requisição de deleção:', e)
          } finally {
            await AsyncStorage.multiRemove(['ore_token', 'ore_user'])
            if (Platform.OS === 'web') {
              alert('Sua conta e seus dados foram apagados com sucesso.')
              window.location.href = '/'
            } else {
              Alert.alert('Conta excluída', 'Sua conta e seus dados foram apagados com sucesso.')
              router.replace('/' as any)
            }
          }
        }
      )
    })
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color="#f59e0b" />
          <Text style={s.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text style={s.sectionHeader}>PREFERÊNCIAS</Text>
        <View style={s.card}>
          {[
            { title: 'Notificações de XP', sub: 'Avisar quando ganhar XP', val: xpNotif, set: toggleXpNotif },
            { title: 'Conquistas desbloqueadas', sub: 'Avisar ao desbloquear uma insígnia', val: achieveNotif, set: toggleAchieveNotif },
            { title: 'Mostrar valores', sub: 'Exibir valores reais no dashboard', val: showValues, set: toggleShowValues, last: true },
          ].map((item, index) => (
            <View key={index} style={[s.row, item.last && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={s.rowTitle}>{item.title}</Text>
                <Text style={s.rowSub}>{item.sub}</Text>
              </View>
              <AmberSwitch
                value={item.val}
                onValueChange={item.set}
              />
            </View>
          ))}
        </View>

        <Text style={s.sectionHeader}>CONTA</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.itemRow} onPress={() => setActiveModal('edit_name')}>
            <Feather name="edit-2" size={18} color="#f59e0b" />
            <Text style={s.itemText}>Alterar nome</Text>
            <Feather name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={s.itemRow} onPress={() => setActiveModal('edit_email')}>
            <Feather name="mail" size={18} color="#f59e0b" />
            <Text style={s.itemText}>Alterar e-mail</Text>
            <Feather name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={[s.itemRow, { borderBottomWidth: 0 }]} onPress={() => setActiveModal('edit_password')}>
            <Feather name="key" size={18} color="#f59e0b" />
            <Text style={s.itemText}>Alterar senha</Text>
            <Feather name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionHeader}>SOBRE</Text>
        <View style={s.card}>
          <View style={s.itemRow}>
            <Feather name="info" size={18} color="#94a3b8" />
            <Text style={s.itemText}>Versão do app</Text>
            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>1.0.0</Text>
          </View>

          <TouchableOpacity style={s.itemRow} onPress={() => setActiveModal('privacy')}>
            <Feather name="shield" size={18} color="#94a3b8" />
            <Text style={s.itemText}>Política de privacidade</Text>
            <Feather name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={s.itemRow} onPress={() => setActiveModal('terms')}>
            <Feather name="file-text" size={18} color="#94a3b8" />
            <Text style={s.itemText}>Termos de uso</Text>
            <Feather name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={[s.itemRow, { borderBottomWidth: 0 }]} onPress={() => setActiveModal('rate')}>
            <Feather name="star" size={18} color="#94a3b8" />
            <Text style={s.itemText}>Avaliar o app</Text>
            <Feather name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        <Text style={[s.sectionHeader, { color: '#ef4444' }]}>ZONA DE PERIGO</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.itemRow} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#ef4444" />
            <Text style={[s.itemText, { color: '#ef4444' }]}>Sair da conta</Text>
            <Feather name="chevron-right" size={18} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity style={[s.itemRow, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
            <Feather name="trash-2" size={18} color="#ef4444" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>Excluir conta</Text>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Apaga todos os dados permanentemente</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={activeModal !== null} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            {activeModal === 'edit_name' && (
              <>
                <Text style={s.modalTitle}>Alterar Nome</Text>
                <Text style={s.inputLabel}>Novo nome de usuário</Text>
                <TextInput
                  style={s.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Seu novo nome"
                  placeholderTextColor="#475569"
                />
                <View style={s.modalBtnGroup}>
                  <TouchableOpacity style={s.modalCancelBtn} onPress={() => setActiveModal(null)}>
                    <Text style={s.modalCancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalSaveBtn} onPress={handleSaveName} disabled={loadingUpdate}>
                    {loadingUpdate ? <ActivityIndicator color="#000" /> : <Text style={s.modalSaveBtnText}>Salvar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeModal === 'edit_email' && (
              <>
                <Text style={s.modalTitle}>Alterar E-mail</Text>
                <Text style={s.inputLabel}>Novo e-mail de acesso</Text>
                <TextInput
                  style={s.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="novoemail@exemplo.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={s.modalBtnGroup}>
                  <TouchableOpacity style={s.modalCancelBtn} onPress={() => setActiveModal(null)}>
                    <Text style={s.modalCancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalSaveBtn} onPress={handleSaveEmail} disabled={loadingUpdate}>
                    {loadingUpdate ? <ActivityIndicator color="#000" /> : <Text style={s.modalSaveBtnText}>Salvar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeModal === 'edit_password' && (
              <>
                <Text style={s.modalTitle}>Alterar Senha</Text>
                <Text style={s.inputLabel}>Nova senha</Text>
                <TextInput
                  style={s.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mínimo de 6 caracteres"
                  placeholderTextColor="#475569"
                  secureTextEntry
                />
                <Text style={s.inputLabel}>Confirmar nova senha</Text>
                <TextInput
                  style={s.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a nova senha"
                  placeholderTextColor="#475569"
                  secureTextEntry
                />
                <View style={s.modalBtnGroup}>
                  <TouchableOpacity style={s.modalCancelBtn} onPress={() => setActiveModal(null)}>
                    <Text style={s.modalCancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalSaveBtn} onPress={handleSavePassword} disabled={loadingUpdate}>
                    {loadingUpdate ? <ActivityIndicator color="#000" /> : <Text style={s.modalSaveBtnText}>Salvar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeModal === 'privacy' && (
              <>
                <Text style={s.modalTitle}>Política de Privacidade</Text>
                <ScrollView style={s.modalScroll}>
                  <Text style={s.modalBody}>
                    O OREFORGE respeita a sua privacidade. Todos os seus dados de investimentos, progressão de XP e credenciais são criptografados e utilizados estritamente para o funcionamento da plataforma.
                    {'\n\n'}
                    Não compartilhamos ou vendemos suas informações financeiras para terceiros. Você pode solicitar a exclusão total dos seus dados a qualquer momento na Zona de Perigo.
                  </Text>
                </ScrollView>
                <TouchableOpacity style={s.modalCloseBtn} onPress={() => setActiveModal(null)}>
                  <Text style={s.modalCloseBtnText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <Text style={s.modalTitle}>Termos de Uso</Text>
                <ScrollView style={s.modalScroll}>
                  <Text style={s.modalBody}>
                    Ao utilizar o OREFORGE, você concorda com o monitoramento educacional de seus investimentos.
                    {'\n\n'}
                    O aplicativo atua como um gerenciador e simulador de gamificação. Os valores e rendimentos exibidos não constituem recomendação oficial de compra ou venda de ativos financeiros.
                  </Text>
                </ScrollView>
                <TouchableOpacity style={s.modalCloseBtn} onPress={() => setActiveModal(null)}>
                  <Text style={s.modalCloseBtnText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}

            {activeModal === 'rate' && (
              <>
                <Text style={s.modalTitle}>Avaliar o OREFORGE</Text>
                <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
                  Como está sendo sua experiência com a forja?
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Feather
                        name="star"
                        size={32}
                        color={star <= rating ? '#f59e0b' : '#334155'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={s.modalCloseBtn}
                  onPress={() => {
                    alert('Obrigado pelo seu feedback!')
                    setActiveModal(null)
                  }}
                >
                  <Text style={s.modalCloseBtnText}>Enviar Avaliação</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const sw = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
})

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg || '#080b14' },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#f59e0b', fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginRight: 16 },
  sectionHeader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#0d1117',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  rowSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  itemText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0d1117',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  modalBody: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 14,
  },
  modalBtnGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
  modalCloseBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
})