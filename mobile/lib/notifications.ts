import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

export async function sendXPNotification(xpGained: number, description: string) {
  if (Platform.OS === 'web') return

  const isEnabled = await AsyncStorage.getItem('pref_xp_notif')
  if (isEnabled === 'false') return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⛏️ Forja Atualizada! (+XP)',
      body: `Você ganhou +${xpGained} XP! ${description}`,
      data: { type: 'xp' },
    },
    trigger: null, // Disparo imediato
  })
}

export async function sendAchievementNotification(badgeName: string) {
  if (Platform.OS === 'web') return

  const isEnabled = await AsyncStorage.getItem('pref_achieve_notif')
  if (isEnabled === 'false') return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏆 Nova Conquista Desbloqueada!',
      body: `Parabéns! Você alcançou a insígnia: ${badgeName}`,
      data: { type: 'achievement' },
    },
    trigger: null,
  })
}