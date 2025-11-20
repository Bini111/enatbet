import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function PropertyDetailsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Property Details</Text>
      <Text style={styles.text}>Full property information will be displayed here</Text>
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
