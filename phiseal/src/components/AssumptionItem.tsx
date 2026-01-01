import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Assumption } from '../types/manifest';

interface AssumptionItemProps {
  item: Assumption;
}

export default function AssumptionItem({ item }: AssumptionItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
    >
      <Text style={styles.id}>{item.id}</Text>
      <Text style={styles.assumption}>{item.assumption}</Text>

      {expanded && (
        <View style={styles.basisContainer}>
          <Text style={styles.basisLabel}>Basis:</Text>
          <Text style={styles.basisText}>{item.basis}</Text>
        </View>
      )}

      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap to see basis'}
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
    borderLeftColor: '#ffaa00',
  },
  id: {
    fontSize: 12,
    color: '#808080',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  assumption: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 8,
  },
  basisContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  basisLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  basisText: {
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
