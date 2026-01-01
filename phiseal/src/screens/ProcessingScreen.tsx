import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import type { IntentType } from '../types/manifest';
import { analyzeDocument, storeManifest } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Manifest } from '../types/manifest';

interface ProcessingScreenProps {
  fileUri: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  intent: IntentType;
  onComplete: (manifest: Manifest) => void;
  onError: (error: string) => void;
}

export default function ProcessingScreen({
  fileUri,
  fileName,
  fileType,
  intent,
  onComplete,
  onError,
}: ProcessingScreenProps) {
  useEffect(() => {
    processDocument();
  }, []);

  const processDocument = async () => {
    try {
      // Analyze document
      const response = await analyzeDocument(fileUri, fileName, fileType, intent);

      if (!response.success || !response.manifest) {
        throw new Error(response.error || 'Analysis failed');
      }

      const manifest = response.manifest;

      // Store manifest locally (client-side)
      const manifestId = `manifest_${Date.now()}`;
      await AsyncStorage.setItem(manifestId, JSON.stringify(manifest));

      // Also store on server for audit trail
      await storeManifest(manifest);

      // Store manifest ID in local list
      const manifestsList = await AsyncStorage.getItem('manifests_list');
      const list = manifestsList ? JSON.parse(manifestsList) : [];
      list.unshift(manifestId);
      await AsyncStorage.setItem('manifests_list', JSON.stringify(list));

      onComplete(manifest);
    } catch (error: any) {
      console.error('Processing error:', error);
      onError(error.message || 'Failed to process document');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a9eff" />
      <Text style={styles.title}>Analyzing Document</Text>
      <Text style={styles.subtitle}>{fileName}</Text>
      <Text style={styles.description}>
        Running HDT² analysis...{'\n'}
        This may take a moment.
      </Text>
      <View style={styles.steps}>
        <Text style={styles.step}>✓ Extracting text</Text>
        <Text style={styles.step}>✓ Generating hash</Text>
        <Text style={styles.step}>⋯ Analyzing with Claude</Text>
        <Text style={styles.stepPending}>⋯ Parsing Ω/Δ/Φ/Ψ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    marginBottom: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
  },
  steps: {
    alignItems: 'flex-start',
  },
  step: {
    fontSize: 14,
    color: '#4a9eff',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  stepPending: {
    fontSize: 14,
    color: '#505050',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});
