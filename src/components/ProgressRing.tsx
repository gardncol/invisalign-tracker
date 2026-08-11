import { View, Text, StyleSheet } from 'react-native';
import type { Theme } from '../utils/theme';

interface ProgressRingProps {
  wornHours: number;
  goalHours: number;
  progressPct: number;
  wornFormatted: string;
  colors: Theme['colors'];
}

export function ProgressRing({ wornHours, goalHours, progressPct, wornFormatted, colors }: ProgressRingProps) {
  const metGoal = wornHours >= goalHours;
  const color = metGoal ? colors.success : progressPct >= 75 ? colors.warning : colors.danger;

  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: color }]}>
        <Text style={[styles.hoursText, { color: colors.text }]}>{wornFormatted}</Text>
        <Text style={[styles.goalText, { color: colors.textSecondary }]}>of {goalHours}h goal</Text>
      </View>
      {metGoal && <Text style={[styles.celebrate, { color: colors.success }]}>🎉 Goal met!</Text>}
    </View>
  );
}

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
  hoursText: { fontSize: 32, fontWeight: '800' },
  goalText: { fontSize: 14, marginTop: 4 },
  celebrate: { fontSize: 18, marginTop: 12, fontWeight: '600' },
});