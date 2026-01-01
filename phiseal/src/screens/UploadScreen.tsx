import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import type { IntentType } from '../types/manifest';

interface UploadScreenProps {
  intent: IntentType;
  onDocumentSelected: (uri: string, name: string, type: 'pdf' | 'docx', hash: string) => void;
  onBack: () => void;
}

export default function UploadScreen({ intent, onDocumentSelected, onBack }: UploadScreenProps) {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: 'pdf' | 'docx';
  } | null>(null);
  const [fileHash, setFileHash] = useState<string>('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.name;
        const fileType = fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';

        // Generate a simple hash for display (full hash will be generated server-side)
        const displayHash = `${Date.now()}_${fileName}`.substring(0, 16);

        setSelectedFile({
          uri: file.uri,
          name: fileName,
          type: fileType,
        });
        setFileHash(displayHash);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Document picker error:', error);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile && fileHash) {
      onDocumentSelected(selectedFile.uri, selectedFile.name, selectedFile.type, fileHash);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Upload Document</Text>

      <Text style={styles.intentText}>
        Intent: <Text style={styles.intentValue}>{intent}</Text>
      </Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickDocument}
      >
        <Text style={styles.uploadButtonText}>
          {selectedFile ? 'Change Document' : 'Select Document'}
        </Text>
        <Text style={styles.uploadButtonSubtext}>
          PDF or DOCX only
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.fileInfoContainer}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoLabel}>Selected File:</Text>
            <Text style={styles.fileInfoValue}>{selectedFile.name}</Text>
          </View>

          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoLabel}>Type:</Text>
            <Text style={styles.fileInfoValue}>{selectedFile.type.toUpperCase()}</Text>
          </View>

          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoLabel}>Hash Preview:</Text>
            <Text style={styles.fileInfoHash}>{fileHash}...</Text>
          </View>
        </View>
      )}

      {selectedFile && (
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
        >
          <Text style={styles.analyzeButtonText}>Analyze Document</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.note}>
        The document will be analyzed using the HDT² framework.{'\n'}
        No data is stored without your consent.
      </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  intentText: {
    fontSize: 16,
    color: '#b0b0b0',
    marginBottom: 32,
  },
  intentValue: {
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  uploadButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#4a9eff',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 8,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: '#808080',
  },
  fileInfoContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  fileInfo: {
    marginBottom: 12,
  },
  fileInfoLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  fileInfoValue: {
    fontSize: 16,
    color: '#ffffff',
  },
  fileInfoHash: {
    fontSize: 14,
    color: '#4a9eff',
    fontFamily: 'monospace',
  },
  analyzeButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  note: {
    fontSize: 12,
    color: '#505050',
    textAlign: 'center',
    lineHeight: 18,
  },
});
