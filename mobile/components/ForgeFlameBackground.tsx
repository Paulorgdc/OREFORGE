import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

function FlamePetal({ delay, startX, size, duration, isAmber }: { delay: number; startX: number; size: number; duration: number; isAmber: boolean }) {
  const translateY = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0)
      translateX.setValue(0)
      opacity.setValue(0)
      rotate.setValue(0)

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -height * 0.7,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 20,
              duration: duration * 0.5,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -20,
              duration: duration * 0.5,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(rotate, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.85,
              duration: duration * 0.25,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.75,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => animate())
    }

    animate()
  }, [delay, duration, opacity, rotate, translateX, translateY])

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  return (
    <Animated.View
      style={[
        s.petal,
        {
          left: startX,
          width: size,
          height: size * 1.8,
          backgroundColor: isAmber ? '#fbbf24' : '#f97316',
          shadowColor: isAmber ? '#f59e0b' : '#ea580c',
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
        },
      ]}
    />
  )
}

export function ForgeFlameBackground() {
  const petals = useRef(
    Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      startX: Math.random() * width,
      size: Math.random() * 6 + 6,
      duration: Math.random() * 3000 + 4500,
      delay: Math.random() * 3500,
      isAmber: i % 2 === 0,
    }))
  ).current

  return (
    <View style={s.overlayBackground} pointerEvents="none">
      <LinearGradient
        colors={['transparent', 'rgba(234, 88, 12, 0.10)', 'rgba(245, 158, 11, 0.32)']}
        style={s.fireGradient}
      />
      {petals.map(p => (
        <FlamePetal
          key={p.id}
          startX={p.startX}
          size={p.size}
          duration={p.duration}
          delay={p.delay}
          isAmber={p.isAmber}
        />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  fireGradient: {
    height: height * 0.25,
    width: '100%',
  },
  petal: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
})