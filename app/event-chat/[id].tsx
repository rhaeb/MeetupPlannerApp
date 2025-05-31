"use client"

import { useRouter, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"

export default function EventChatScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  useEffect(() => {
    // Fix: Don't return the router.replace call
    if (id) {
      router.push(`/chat/${id}?type=event`)
    }
  }, [id, router])

  return null
}
