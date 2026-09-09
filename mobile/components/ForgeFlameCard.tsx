import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface ForgeFlameCardProps {
  children: React.ReactNode
  style?: ViewStyle
}

export default function ForgeFlameCard({ children, style }: ForgeFlameCardProps) {
  return (
    <View style={[s.card, style]}>
      <View style={s.glowBorder} pointerEvents="none" />
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(13, 17, 23, 0.92)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.12)',
  },
})