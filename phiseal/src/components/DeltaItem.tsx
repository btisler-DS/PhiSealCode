import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DeltaItem as DeltaItemType } from '../types/manifest';

interface DeltaItemProps {
  item: DeltaItemType;
}

export default function DeltaItem({ item }: DeltaItemProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#ffdd00';
      default:
        return '#808080';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.header}>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
        </View>
        <Text style={styles.id}>{item.id}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      {expanded && (
        <View style={styles.contextContainer}>
          <Text style={styles.contextLabel}>Context:</Text>
          <Text style={styles.contextText}>{item.context}</Text>
        </View>
      )}

      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap to see context'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  id: {
    fontSize: 12,
    color: '#808080',
    fontFamily: 'monospace',
  },
  description: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 8,
  },
  contextContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  contextLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  contextText: {
    fontSize: 14,
    color: '#b0b0b0',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  expandHint: {
    fontSize: 11,
    color: '#505050',
    marginTop: 4,
  },
});
