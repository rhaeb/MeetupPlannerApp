import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { ProfileProvider } from '../../contexts/ProfileContext'; 

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
      }}
    >
      {/* Home Screen with AppHeader */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          header: () => (
            <SafeAreaView style={styles.safeArea}>
              <AppHeader />
            </SafeAreaView>
          ),
        }}
      />

      {/* Events Screen with AppHeader */}
      <Tabs.Screen
        name="events/index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
          header: () => (
            <SafeAreaView style={styles.safeArea}>
              <AppHeader />
            </SafeAreaView>
          ),
        }}
      />

      {/* Friends Screen without AppHeader */}
      <Tabs.Screen
        name="friends/index"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
          header: () => (
            <SafeAreaView style={styles.safeArea}>
              <AppHeader />
            </SafeAreaView>
          ),
        }}
      />

      {/* Messages Screen without AppHeader */}
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          header: () => (
            <SafeAreaView style={styles.safeArea}>
              <AppHeader />
            </SafeAreaView>
          ),
        }}
      />

      {/* Profile Screen with AppHeader */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          header: () => (
            <SafeAreaView style={styles.safeArea}>
              {/* <AppHeader /> */}
            </SafeAreaView>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff', // Match the AppHeader background color
  },
});