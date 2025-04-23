import { Stack } from 'expo-router/stack';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray[50] },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="event-details/[id]" 
        options={{ 
          title: 'Event Details',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen name="poll/[id]" options={{ title: 'Poll' }} />
      <Stack.Screen name="budget/[id]" options={{ title: 'Budget' }} />
      <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}