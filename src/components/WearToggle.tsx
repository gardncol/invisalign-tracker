import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CurrentTrayState } from '../types';

interface WearToggleProps {
  state: CurrentTrayState;
  elapsedMinutes: number;
  onPress: () => void;
}

export function WearToggle({ state, elapsedMinutes, onPress }: WearToggleProps) {
  const isIn = state === 'in';
  const label = isIn ? 'TRAYS IN' : state === 'out' ? 'TRAYS OUT' : 'TAP TO START';
  const bgColor = isIn ? '#34C759' : '#FF3B30';
  const subtitle = isIn
    ? `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`
    : elapsedMinutes > 0
    ? `Out for ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`
    : '';

  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: state === 'unknown' ? '#007AFF' : bgColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.label}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  label: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
});