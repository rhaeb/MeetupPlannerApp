import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "../constants/colors"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "outline"
  color?: string
  textColor?: string
  size?: "sm" | "md"
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", color, textColor, size = "sm" }) => {
  const backgroundColor = variant === "default" ? color || colors.green[500] : "transparent"
  const borderColor = variant === "outline" ? color || colors.green[500] : "transparent"
  const textColorValue = variant === "default" ? textColor || colors.white : color || colors.green[500]

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor, borderColor },
        variant === "outline" && styles.outlineBadge,
        size === "sm" ? styles.badgeSm : styles.badgeMd,
      ]}
    >
      <Text style={[styles.text, { color: textColorValue }, size === "sm" ? styles.textSm : styles.textMd]}>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBadge: {
    borderWidth: 1,
  },
  badgeSm: {
    paddingVertical: 2,
  },
  badgeMd: {
    paddingVertical: 4,
  },
  text: {
    fontWeight: "500",
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
})

export default Badge
