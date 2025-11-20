import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function SearchScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Search Properties</Text>
      <Text style={styles.text}>Search functionality coming soon</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
});
