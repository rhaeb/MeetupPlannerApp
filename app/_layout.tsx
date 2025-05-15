import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter, usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { ProfileProvider } from './ProfileContext'; 

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Only redirect to /tabs if NOT on an auth page
      const isAuthPage =
        pathname === '/login' ||
        pathname === '/forgotPassword' ||
        pathname === '/reset-password-confirm';

      if (user && !isAuthPage) {
        router.replace('/tabs');
      } else if (!user && !isAuthPage) {
        router.replace('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    // Show a loading indicator while checking authentication
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <>
      <ProfileProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="tabs" />
          <Stack.Screen name="login" />
        </Stack>
      </ProfileProvider>
    </>
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
