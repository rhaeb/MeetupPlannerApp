import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from "react-native"
import { supabase } from "../../lib/supabase"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

export default function ProfileScreen() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data) {
        setUser(data.user)
      }
    }
    fetchUser()

    // Correctly handle the auth state change listener
  const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
    setUser(session?.user || null)
  })

  // Return a cleanup function
  return () => {
    authListener?.subscription.unsubscribe() // Correct access to subscription
  }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <LinearGradient colors={["#059669", "#047857"]} style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.email[0].toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.userName}>{user?.email}</Text>
        </LinearGradient>

        {/* Additional profile details */}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#222" },
  scrollView: { marginTop: 20 },
  profileHeader: {
    padding: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "#047857" },
  avatarImage: { width: "100%", height: "100%", borderRadius: 60 },
  userName: { fontSize: 18, color: "#fff" },
})
