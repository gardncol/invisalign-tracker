import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';
import type { WeekSummary } from '../types';
import type { Theme } from '../utils/theme';

interface LineChartProps {
  data: WeekSummary[];
  goalHours: number;
  colors: Theme['colors'];
}

// The chart sits inside two layers of 16px padding: the reports screen container
// and this component's own container. Reserve horizontal margin inside the chart
// area so the first and last points (and their value labels) don't clip.
const CHART_WIDTH = Dimensions.get('window').width - 64; // screen - 32 (screen pad) - 32 (container pad)
const HEIGHT = 200;
const SIDE_PADDING = 20; // keep points/labels inside the chart bounds

export function LineChart({ data, goalHours, colors }: LineChartProps) {
  const maxHours = Math.max(goalHours, ...data.map((d) => d.avgHoursPerDay), 24);
  const usableWidth = CHART_WIDTH - SIDE_PADDING * 2;
  const stepX = data.length > 1 ? usableWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: SIDE_PADDING + i * stepX,
    y: HEIGHT - (d.avgHoursPerDay / maxHours) * HEIGHT,
    value: d.avgHoursPerDay,
    week: d.weekStart,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Weekly Trend (Last 12 Weeks)</Text>
      <View style={styles.chartArea}>
        <View style={[styles.goalLine, { bottom: (goalHours / maxHours) * HEIGHT, backgroundColor: colors.danger }]} />
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              styles.point,
              { left: p.x - 4, top: p.y - 4 },
              { backgroundColor: p.value >= goalHours ? colors.success : colors.warning },
            ]}
          >
            <Text style={[styles.pointValue, { color: colors.textSecondary }]}>{p.value.toFixed(1)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.xLabels}>
        {data.map((d, i) => (
          <Text key={i} style={[styles.xLabel, { color: colors.textTertiary }]}>
            {format(d.weekStart, 'MMM d')}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  chartArea: { position: 'relative', height: HEIGHT, width: CHART_WIDTH, marginBottom: 8 },
  goalLine: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.4 },
  point: { position: 'absolute', width: 8, height: 8, borderRadius: 4, justifyContent: 'center' },
  pointValue: { position: 'absolute', fontSize: 10, top: -16, left: -8, width: 40, textAlign: 'center' },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SIDE_PADDING - 8 },
  xLabel: { fontSize: 10 },
});