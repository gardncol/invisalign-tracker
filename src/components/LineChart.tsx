import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';
import type { WeekSummary } from '../types';

interface LineChartProps {
  data: WeekSummary[];
  goalHours: number;
}

const WIDTH = Dimensions.get('window').width - 32;
const HEIGHT = 200;

export function LineChart({ data, goalHours }: LineChartProps) {
  const maxHours = Math.max(goalHours, ...data.map((d) => d.avgHoursPerDay), 24);
  const stepX = data.length > 1 ? WIDTH / (data.length - 1) : 0;

  // Build points for the line chart
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: HEIGHT - (d.avgHoursPerDay / maxHours) * HEIGHT,
    value: d.avgHoursPerDay,
    week: d.weekStart,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Trend (Last 12 Weeks)</Text>
      <View style={styles.chartArea}>
        {/* Goal line */}
        <View
          style={[
            styles.goalLine,
            { bottom: (goalHours / maxHours) * HEIGHT },
          ]}
        />
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              styles.point,
              { left: p.x - 4, top: p.y - 4 },
              { backgroundColor: p.value >= goalHours ? '#34C759' : '#FF9500' },
            ]}
          >
            <Text style={styles.pointValue}>{p.value.toFixed(1)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.xLabels}>
        {data.map((d, i) => (
          <Text key={i} style={styles.xLabel}>
            {format(d.weekStart, 'MMM d')}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Note: MVP uses View-based dots. Replace with victory-native Skia line in V1.1.
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#1a1a1a' },
  chartArea: { position: 'relative', height: HEIGHT, width: WIDTH, marginBottom: 8 },
  goalLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#FF3B30', opacity: 0.4 },
  point: { position: 'absolute', width: 8, height: 8, borderRadius: 4, justifyContent: 'center' },
  pointValue: { position: 'absolute', fontSize: 10, color: '#666', top: -16, left: -8, width: 40 },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  xLabel: { fontSize: 10, color: '#999' },
});