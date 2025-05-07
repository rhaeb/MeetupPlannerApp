import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from './lib/supabase'; // Ensure correct import for supabase

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated on initial load
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Use getSession instead of session()
      setIsAuthenticated(!!session?.user);
    };

    checkAuth();

    // Subscribe to auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setIsAuthenticated(!!session?.user);
      }
    );

    // Cleanup listener on unmount
    return () => {
      subscription.unsubscribe(); // Unsubscribe from the listener
    };
  }, []);

  useEffect(() => {
    // Redirect to the correct screen based on authentication status
    if (isAuthenticated) {
      router.replace('/(tabs)'); // Redirect to tabs if authenticated
    } else {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Conditionally render login or tabs based on authentication */}
        {!isAuthenticated ? (
          <Stack.Screen name="login" />
        ) : (
          <Stack.Screen name="tabs" />
        )}
        <Stack.Screen name="attendees/[eventId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="chats/[userId]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
