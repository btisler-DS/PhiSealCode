import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { IntentType } from '../types/manifest';

interface OnboardingScreenProps {
  onIntentSelected: (intent: IntentType) => void;
}

export default function OnboardingScreen({ onIntentSelected }: OnboardingScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PhiSeal</Text>

      <Text style={styles.description}>
        PhiSeal shows what documents don't say.{'\n\n'}
        It finds gaps, assumptions, and ambiguities without filling them in.
      </Text>

      <View style={styles.intentContainer}>
        <Text style={styles.intentLabel}>Select your intent:</Text>

        <TouchableOpacity
          style={styles.intentButton}
          onPress={() => onIntentSelected('analysis')}
        >
          <Text style={styles.intentButtonText}>Analysis</Text>
          <Text style={styles.intentButtonSubtext}>
            Identify gaps and ambiguities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.intentButton}
          onPress={() => onIntentSelected('review')}
        >
          <Text style={styles.intentButtonText}>Review</Text>
          <Text style={styles.intentButtonSubtext}>
            Examine document structure
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.intentButton}
          onPress={() => onIntentSelected('audit')}
        >
          <Text style={styles.intentButtonText}>Audit</Text>
          <Text style={styles.intentButtonSubtext}>
            Verify completeness and consistency
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Powered by HDT² Framework{'\n'}
        Edos Covenant License v1.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#b0b0b0',
    lineHeight: 24,
    marginBottom: 48,
    textAlign: 'center',
  },
  intentContainer: {
    marginBottom: 48,
  },
  intentLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: '600',
  },
  intentButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  intentButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  intentButtonSubtext: {
    fontSize: 14,
    color: '#808080',
  },
  footer: {
    fontSize: 12,
    color: '#505050',
    textAlign: 'center',
    lineHeight: 18,
  },
});
