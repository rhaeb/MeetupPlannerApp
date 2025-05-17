// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { ProfileProvider } from '../contexts/ProfileContext';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const authPaths = ['/login', '/forgotPassword', '/reset-password-confirm', '/signup'];
      const isAuthPage = authPaths.includes(pathname);

      if (user && isAuthPage) {
        router.replace('/tabs');
      } else if (!user && !isAuthPage) {
        router.replace('/login'); // or '/(auth)' if that is your main auth route
      }
    }
  }, [user, loading, pathname]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ProfileProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="tabs" />
      </Stack>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
