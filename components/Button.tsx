import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import { colors } from "../constants/colors"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
    fullWidth && styles.button_fullWidth,
    style,
  ]

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.text_disabled,
    textStyle,
  ]

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? colors.white : colors.green[600]} />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: 8,
  },
  button_primary: {
    backgroundColor: colors.green[600],
  },
  button_outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  button_ghost: {
    backgroundColor: "transparent",
  },
  button_sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  button_md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  button_lg: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  button_disabled: {
    opacity: 0.5,
  },
  button_fullWidth: {
    width: "100%",
  },
  text: {
    fontWeight: "600",
  },
  text_primary: {
    color: colors.white,
  },
  text_outline: {
    color: colors.gray[900],
  },
  text_ghost: {
    color: colors.gray[900],
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  text_disabled: {
    opacity: 0.7,
  },
})

export default Button
