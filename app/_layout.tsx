import { Slot } from 'expo-router/';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot /> {/* This renders the active route */}
    </View>
  );
}