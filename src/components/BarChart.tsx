import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';
import type { DaySummary } from '../types';
import type { Theme } from '../utils/theme';

interface BarChartProps {
  data: DaySummary[];
  goalHours: number;
  colors: Theme['colors'];
}

const WIDTH = Dimensions.get('window').width - 64; // screen - 32 (screen pad) - 32 (container pad)
const BAR_WIDTH = (WIDTH - 32) / 7 - 4;

export function BarChart({ data, goalHours, colors }: BarChartProps) {
  const maxHours = Math.max(goalHours, ...data.map((d) => d.totalWornHours), 24);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Last 7 Days</Text>
      <View style={styles.chartRow}>
        {data.map((day, i) => {
          const barHeight = (day.totalWornHours / maxHours) * 200;
          const metGoal = day.metGoal;
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2),
                      backgroundColor: metGoal ? colors.success : colors.warning,
                    },
                  ]}
                />
                <View style={[styles.goalLine, { bottom: (goalHours / maxHours) * 200, backgroundColor: colors.danger }]} />
              </View>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{format(day.date, 'EEE')}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.legend, { color: colors.textTertiary }]}>Green = goal met · Orange = below goal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 220 },
  barCol: { alignItems: 'center', width: BAR_WIDTH },
  barTrack: { width: BAR_WIDTH - 4, height: 200, justifyContent: 'flex-end', position: 'relative' },
  bar: { width: '100%', borderRadius: 4, minHeight: 2 },
  goalLine: { position: 'absolute', left: -4, right: -4, height: 2, opacity: 0.6 },
  dayLabel: { fontSize: 12, marginTop: 8 },
  legend: { fontSize: 12, marginTop: 8, textAlign: 'center' },
});