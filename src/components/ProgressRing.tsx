import { View, Text, StyleSheet } from 'react-native';

interface ProgressRingProps {
  wornHours: number;
  goalHours: number;
  progressPct: number;
  wornFormatted: string;
}

export function ProgressRing({ wornHours, goalHours, progressPct, wornFormatted }: ProgressRingProps) {
  const metGoal = wornHours >= goalHours;
  const color = metGoal ? '#34C759' : progressPct >= 75 ? '#FF9500' : '#FF3B30';

  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: color }]}>
        <Text style={styles.hoursText}>{wornFormatted}</Text>
        <Text style={styles.goalText}>of {goalHours}h goal</Text>
      </View>
      {metGoal && <Text style={styles.celebrate}>🎉 Goal met!</Text>}
    </View>
  );
}

// Note: For MVP, this is a simple visual. Replace with Reanimated circular progress in V1.1.
const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  ring: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursText: { fontSize: 32, fontWeight: '800', color: '#1a1a1a' },
  goalText: { fontSize: 14, color: '#666', marginTop: 4 },
  celebrate: { fontSize: 18, marginTop: 12, fontWeight: '600' },
});