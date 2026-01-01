import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Conflict } from '../types/manifest';

interface ConflictItemProps {
  item: Conflict;
}

export default function ConflictItem({ item }: ConflictItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
    >
      <Text style={styles.id}>{item.id}</Text>
      <Text style={styles.conflict}>{item.conflict}</Text>

      {expanded && (
        <View style={styles.locationsContainer}>
          <Text style={styles.locationsLabel}>Locations:</Text>
          {item.locations.map((location, index) => (
            <Text key={index} style={styles.locationText}>
              • {location}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap to see locations'}
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
    borderLeftColor: '#ff8800',
  },
  id: {
    fontSize: 12,
    color: '#808080',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  conflict: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 8,
  },
  locationsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  locationsLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 4,
  },
  expandHint: {
    fontSize: 11,
    color: '#505050',
    marginTop: 4,
  },
});
