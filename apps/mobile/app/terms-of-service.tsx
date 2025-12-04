import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { termsOfService, formatContent } from '@enatbet/legal';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{termsOfService.title}</Text>
          <Text style={styles.date}>Last Updated: {termsOfService.lastUpdated}</Text>
          <Text style={styles.date}>Effective: {termsOfService.effectiveDate}</Text>
        </View>

        {/* Sections */}
        {termsOfService.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {formatContent(section.content).map((paragraph, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {/* Acknowledgment */}
        <View style={styles.acknowledgment}>
          <Text style={styles.acknowledgmentText}>
            {termsOfService.acknowledgment}
          </Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => router.push('/privacy-policy')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>Privacy Policy →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.navButton, styles.navButtonSecondary]}
          >
            <Text style={styles.navButtonTextSecondary}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  acknowledgment: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  acknowledgmentText: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  navigation: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  navButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  navButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextSecondary: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
