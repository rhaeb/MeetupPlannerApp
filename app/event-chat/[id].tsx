"use client"

import { useRouter, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"

export default function EventChatScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  useEffect(() => {
    // Redirect to the main chat screen with event type
    router.replace(`/chat/${id}?type=event`)
  }, [id, router])

  return null
}
