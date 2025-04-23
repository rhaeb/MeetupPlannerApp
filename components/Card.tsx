import type React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { colors } from "../constants/colors"

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>
}

interface CardContentProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: boolean
}

export const CardContent: React.FC<CardContentProps> = ({ children, style, padding = true }) => {
  return <View style={[styles.content, padding && styles.padding, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  content: {
    width: "100%",
  },
  padding: {
    padding: 16,
  },
})
