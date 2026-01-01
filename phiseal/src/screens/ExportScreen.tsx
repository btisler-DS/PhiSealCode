import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import type { Manifest } from '../types/manifest';

interface ExportScreenProps {
  manifest: Manifest;
  onBack: () => void;
}

export default function ExportScreen({ manifest, onBack }: ExportScreenProps) {
  const manifestJson = JSON.stringify(manifest, null, 2);

  const handleCopy = () => {
    Clipboard.setString(manifestJson);
    Alert.alert('Copied', 'Manifest copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: manifestJson,
        title: 'PhiSeal Analysis Manifest',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Results</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Export Manifest</Text>

      <Text style={styles.note}>
        This is your audit trail.{'\n'}
        The manifest contains the complete analysis with file hash and timestamp.
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>File Hash:</Text>
          <Text style={styles.infoValue}>{manifest.manifest.file_hash.substring(0, 16)}...</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Timestamp:</Text>
          <Text style={styles.infoValue}>
            {new Date(manifest.manifest.timestamp).toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Engine:</Text>
          <Text style={styles.infoValue}>{manifest.manifest.engine_version}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Intent:</Text>
          <Text style={styles.infoValue}>{manifest.manifest.intent}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Text style={styles.actionButtonText}>Copy to Clipboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionButtonText}>Share Manifest</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.jsonContainer}>
        <Text style={styles.jsonLabel}>Full Manifest JSON:</Text>
        <Text style={styles.jsonText}>{manifestJson}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
  },
  backButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  backButtonText: {
    color: '#4a9eff',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: '#808080',
    marginBottom: 24,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#4a9eff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
  },
  jsonContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
  },
  jsonLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 12,
  },
  jsonText: {
    fontSize: 12,
    color: '#4a9eff',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
