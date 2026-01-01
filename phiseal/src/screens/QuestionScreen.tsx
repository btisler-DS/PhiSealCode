import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { Manifest } from '../types/manifest';

interface QuestionScreenProps {
  manifest: Manifest;
  onBack: () => void;
}

export default function QuestionScreen({ manifest, onBack }: QuestionScreenProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      // In a real implementation, this would call the API
      // For now, we'll show a placeholder response
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAnswer(
        `This feature queries the analysis results, not the original document.\n\n` +
        `Your question: "${question}"\n\n` +
        `The analysis contains:\n` +
        `• ${manifest.analysis.delta.length} gaps (Δ)\n` +
        `• ${manifest.analysis.assumptions.length} assumptions\n` +
        `• ${manifest.analysis.conflicts.length} conflicts\n\n` +
        `Please refer to the Results screen for detailed findings.`
      );
    } catch (error) {
      setAnswer('Failed to process question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Results</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ask a Question</Text>

      <Text style={styles.note}>
        This queries the analysis, not the document
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your question..."
        placeholderTextColor="#505050"
        value={question}
        onChangeText={setQuestion}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, !question.trim() && styles.submitButtonDisabled]}
        onPress={handleAskQuestion}
        disabled={!question.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Question</Text>
        )}
      </TouchableOpacity>

      {answer && (
        <ScrollView style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </ScrollView>
      )}
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
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  answerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
  },
  answerLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
});
