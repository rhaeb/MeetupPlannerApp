"use client";

import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import AppHeader from "../../components/AppHeader";

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>
      {/* Add content for friends here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
});