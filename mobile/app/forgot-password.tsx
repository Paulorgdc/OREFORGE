import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { api } from '../lib/api'
import { Colors } from '../constants/colors'
import { ForgeFlameBackground } from '../components/ForgeFlameBackground'
import ForgeFlameCard from '../components/ForgeFlameCard'

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const showAlert = (title: string, msg: string) => {
    Platform.OS === 'web' ? alert(`${title}: ${msg}`) : Alert.alert(title, msg)
  }

  async function handleSendCode() {
    if (!email) return showAlert('Atenção', 'Informe seu e-mail.')

    setLoading(true)
    try {
      const data = await api.forgotPassword(email.trim())
      if (data?.code) {
        showAlert('Código Gerado (Modo Dev)', `Seu código é: ${data.code}`)
      } else {
        showAlert('E-mail enviado', 'Se o e-mail estiver cadastrado, um código foi enviado.')
      }
      setStep(2)
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Erro ao gerar código.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode() {
    if (!code) return showAlert('Atenção', 'Informe o código de 6 dígitos.')

    setLoading(true)
    try {
      await api.verifyResetCode(email.trim(), code.trim())
      setStep(3)
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Código inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!newPassword || !confirmPassword) {
      return showAlert('Atenção', 'Preencha a nova senha e confirmação.')
    }
    if (newPassword !== confirmPassword) {
      return showAlert('Atenção', 'As senhas não coincidem.')
    }

    setLoading(true)
    try {
      await api.resetPassword(email.trim(), code.trim(), newPassword)
      showAlert('Sucesso', 'Sua senha foi redefinida com sucesso!')
      router.replace('/')
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#080b14' }}>
      <ForgeFlameBackground />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={Colors.accent} />
            <Text style={s.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={s.brandContainer}>
            <Text style={s.brandText}>
              ORE<Text style={{ color: Colors.accent }}>FORGE</Text>
            </Text>
            <Text style={s.subTitle}>
              {step === 1 && 'Recuperação de Acesso'}
              {step === 2 && 'Código de Verificação'}
              {step === 3 && 'Nova Senha'}
            </Text>
          </View>

          <ForgeFlameCard>
            {step === 1 && (
              <>
                <View style={s.inputGroup}>
                  <Text style={s.label}>DIGITE SEU EMAIL</Text>
                  <View style={s.inputWrapper}>
                    <Feather name="mail" size={18} color="#64748b" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      placeholder="seu@email.com"
                      placeholderTextColor="#475569"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <TouchableOpacity style={s.submitBtn} onPress={handleSendCode} disabled={loading}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={s.submitBtnText}>Enviar código</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                  Enviamos um código de 6 dígitos para{'\n'}
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{email}</Text>
                </Text>

                <View style={s.inputGroup}>
                  <Text style={s.label}>CÓDIGO DE VERIFICAÇÃO</Text>
                  <View style={s.inputWrapper}>
                    <Feather name="key" size={18} color="#64748b" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      placeholder="123456"
                      placeholderTextColor="#475569"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                    />
                  </View>
                </View>

                <TouchableOpacity style={s.submitBtn} onPress={handleVerifyCode} disabled={loading}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={s.submitBtnText}>Verificar Código</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <View style={s.inputGroup}>
                  <Text style={s.label}>NOVA SENHA</Text>
                  <View style={s.inputWrapper}>
                    <Feather name="lock" size={18} color="#64748b" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      placeholder="Digite a nova senha"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </View>

                <View style={s.inputGroup}>
                  <Text style={s.label}>CONFIRMAR NOVA SENHA</Text>
                  <View style={s.inputWrapper}>
                    <Feather name="lock" size={18} color="#64748b" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      placeholder="Repita a nova senha"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity style={s.submitBtn} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={s.submitBtnText}>Redefinir Senha</Text>}
                </TouchableOpacity>
              </>
            )}
          </ForgeFlameCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subTitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
})