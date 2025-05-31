"use client"

import { useRouter, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"

export default function EventChatScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  useEffect(() => {
    // Just call router.replace, don't return it
    router.replace(`/chat/${id}?type=event`)
  }, [id, router])

  return null
}
