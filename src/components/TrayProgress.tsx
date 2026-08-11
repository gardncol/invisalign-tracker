import { View, Text, StyleSheet } from 'react-native';

interface TrayProgressProps {
  current: number;
  total: number;
  pct: number;
}

export function TrayProgress({ current, total, pct }: TrayProgressProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tray {current} of {total}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.pct}>{pct}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  barBackground: { width: 200, height: 12, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 6 },
  pct: { fontSize: 14, color: '#666', marginTop: 4 },
});