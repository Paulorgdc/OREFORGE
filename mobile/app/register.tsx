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

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      const msg = 'Por favor, preencha todos os campos.'
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg)
      return
    }

    if (password !== confirmPassword) {
      const msg = 'As senhas não coincidem.'
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg)
      return
    }

    setLoading(true)
    try {
      const { token, user } = await api.register(name.trim(), email.trim(), password)
      await AsyncStorage.setItem('ore_token', token)
      await AsyncStorage.setItem('ore_user', JSON.stringify(user))
      router.replace('/(tabs)')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Erro ao criar conta.'
      Platform.OS === 'web' ? alert(errorMsg) : Alert.alert('Erro no Registro', errorMsg)
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
            <Text style={s.subTitle}>Crie sua conta e comece a minerar</Text>
          </View>

          <ForgeFlameCard>
            <View style={s.inputGroup}>
              <Text style={s.label}>NOME</Text>
              <View style={s.inputWrapper}>
                <Feather name="user" size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

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
              <Text style={s.label}>SENHA</Text>
              <View style={s.inputWrapper}>
                <Feather name="lock" size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Crie uma senha forte"
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

            <View style={s.inputGroup}>
              <Text style={s.label}>CONFIRMAR SENHA</Text>
              <View style={s.inputWrapper}>
                <Feather name="lock" size={18} color="#64748b" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Repita a senha"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <View style={s.bonusBadge}>
              <Feather name="zap" size={16} color={Colors.accent} />
              <Text style={s.bonusText}>+50 XP ao criar sua conta!</Text>
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={s.submitBtnText}>Criar conta grátis</Text>
              )}
            </TouchableOpacity>
          </ForgeFlameCard>

          <View style={s.footer}>
            <Text style={s.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={s.loginText}>Entrar</Text>
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
    marginBottom: 24,
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
    marginBottom: 14,
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
  eyeBtn: {
    padding: 4,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.accent}15`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${Colors.accent}30`,
  },
  bonusText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 20,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  loginText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
})