import type React from "react"
import { View, Image, Text, StyleSheet } from "react-native"
import { colors } from "../constants/colors"

interface AvatarProps {
  source?: { uri: string }
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  borderColor?: string
}

const Avatar: React.FC<AvatarProps> = ({ source, name, size = "md", borderColor }) => {
  const getSize = () => {
    switch (size) {
      case "sm":
        return 32
      case "md":
        return 40
      case "lg":
        return 48
      case "xl":
        return 96
      default:
        return 40
    }
  }

  const avatarSize = getSize()
  const fontSize = avatarSize * 0.4

  const getInitials = (name?: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    borderColor ? { borderWidth: 2, borderColor } : null,
  ]

  return (
    <View style={containerStyle}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.fallback, { backgroundColor: colors.green[500] }]}>
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.white,
    fontWeight: "600",
  },
})

export default Avatar
