import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Manifest } from '../types/manifest';
import DeltaItem from '../components/DeltaItem';
import AssumptionItem from '../components/AssumptionItem';
import ConflictItem from '../components/ConflictItem';

interface ResultsScreenProps {
  manifest: Manifest;
  onAskQuestion: () => void;
  onExport: () => void;
  onNewAnalysis: () => void;
}

export default function ResultsScreen({
  manifest,
  onAskQuestion,
  onExport,
  onNewAnalysis,
}: ResultsScreenProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('delta');

  const { delta, assumptions, conflicts } = manifest.analysis;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analysis Results</Text>
        <Text style={styles.subtitle}>
          {manifest.manifest.intent} · {manifest.manifest.engine_version}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Gaps (Δ) Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('delta')}
        >
          <Text style={styles.sectionIcon}>🔴</Text>
          <Text style={styles.sectionTitle}>
            Gaps (Δ) · {delta.length}
          </Text>
          <Text style={styles.sectionExpand}>
            {expandedSection === 'delta' ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'delta' && (
          <View style={styles.sectionContent}>
            {delta.length === 0 ? (
              <Text style={styles.emptyText}>No gaps identified</Text>
            ) : (
              delta.map((item) => (
                <DeltaItem key={item.id} item={item} />
              ))
            )}
          </View>
        )}

        {/* Assumptions Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('assumptions')}
        >
          <Text style={styles.sectionIcon}>🟡</Text>
          <Text style={styles.sectionTitle}>
            Assumptions · {assumptions.length}
          </Text>
          <Text style={styles.sectionExpand}>
            {expandedSection === 'assumptions' ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'assumptions' && (
          <View style={styles.sectionContent}>
            {assumptions.length === 0 ? (
              <Text style={styles.emptyText}>No assumptions identified</Text>
            ) : (
              assumptions.map((item) => (
                <AssumptionItem key={item.id} item={item} />
              ))
            )}
          </View>
        )}

        {/* Conflicts Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('conflicts')}
        >
          <Text style={styles.sectionIcon}>🟠</Text>
          <Text style={styles.sectionTitle}>
            Conflicts · {conflicts.length}
          </Text>
          <Text style={styles.sectionExpand}>
            {expandedSection === 'conflicts' ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'conflicts' && (
          <View style={styles.sectionContent}>
            {conflicts.length === 0 ? (
              <Text style={styles.emptyText}>No conflicts identified</Text>
            ) : (
              conflicts.map((item) => (
                <ConflictItem key={item.id} item={item} />
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={onAskQuestion}>
          <Text style={styles.footerButtonText}>Ask Question</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={onExport}>
          <Text style={styles.footerButtonText}>Export Manifest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.newAnalysisButton]}
          onPress={onNewAnalysis}
        >
          <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#808080',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#0a0a0a',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionExpand: {
    fontSize: 24,
    color: '#808080',
  },
  sectionContent: {
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#505050',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  footerButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
  },
  newAnalysisButton: {
    backgroundColor: '#4a9eff',
    borderColor: '#4a9eff',
  },
  newAnalysisButtonText: {
    color: '#ffffff',
  },
});
