import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function RootLayout() {
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await AsyncStorage.getItem('ore_token')
        if (token) {
          router.replace('/(tabs)')
        }
      } catch {
        // Silently handle read error
      }
    }
    checkAuth()
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#080b14' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}