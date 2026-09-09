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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Feather } from '@expo/vector-icons'
import { api } from '../lib/api'
import { Colors } from '../constants/colors'
import { ForgeFlameBackground } from '../components/ForgeFlameBackground'
import ForgeFlameCard from '../components/ForgeFlameCard'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      const msg = 'Por favor, preencha o e-mail e a senha.'
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg)
      return
    }

    setLoading(true)
    try {
      const { token, user } = await api.login(email.trim(), password)
      await AsyncStorage.setItem('ore_token', token)
      await AsyncStorage.setItem('ore_user', JSON.stringify(user))
      router.replace('/(tabs)')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Não foi possível conectar ao servidor.'
      Platform.OS === 'web' ? alert(errorMsg) : Alert.alert('Erro no Login', errorMsg)
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
          <View style={s.brandContainer}>
            <Text style={s.brandText}>
              ORE<Text style={{ color: Colors.accent }}>FORGE</Text>
            </Text>
            <Text style={s.subTitle}>Entre na sua conta</Text>
          </View>

          <ForgeFlameCard>
            <View style={s.inputGroup}>
              <Text style={s.label}>EMAIL</Text>
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

            <View style={s.inputGroup}>
              <View style={s.labelRow}>
                <Text style={s.label}>SENHA</Text>
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <Text style={s.forgotText}>Esqueci a senha</Text>
                </TouchableOpacity>
              </View>
              <View style={s.inputWrapper}>
                <Feather name="lock" size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={s.submitBtnText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </ForgeFlameCard>

          <View style={s.footer}>
            <Text style={s.footerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={s.signupText}>Criar grátis</Text>
            </TouchableOpacity>
          </View>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  forgotText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
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
  eyeBtn: {
    padding: 4,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  signupText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
})