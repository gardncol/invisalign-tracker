import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEventStore } from '../../src/stores/useEventStore';
import { getDailySummaries, getWeeklySummaries, getOverallCompliance } from '../../src/services/reporting';
import { BarChart } from '../../src/components/BarChart';
import { LineChart } from '../../src/components/LineChart';
import { formatHours } from '../../src/utils/dates';
import type { DaySummary, WeekSummary } from '../../src/types';

export default function ReportsScreen() {
  const { user } = useUserStore();
  const { getEventsForRange } = useEventStore();
  const [daily, setDaily] = useState<DaySummary[]>([]);
  const [weekly, setWeekly] = useState<WeekSummary[]>([]);
  const [compliance, setCompliance] = useState(0);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const now = new Date();
      const twelveWeeksAgo = new Date();
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

      const events = await getEventsForRange(twelveWeeksAgo, now);
      const dailyData = getDailySummaries(events, user, 7, now);
      const weeklyData = getWeeklySummaries(events, user, 12, now);
      const compliancePct = getOverallCompliance(events, user, twelveWeeksAgo, now);

      setDaily(dailyData);
      setWeekly(weeklyData);
      setCompliance(compliancePct);
    })();
  }, [user, getEventsForRange]);

  if (!user) return null;

  const avgThisWeek = daily.length > 0
    ? daily.reduce((sum, d) => sum + d.totalWornHours, 0) / daily.length
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reports</Text>

      {/* Summary cards */}
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>This Week Avg</Text>
          <Text style={styles.cardValue}>{formatHours(avgThisWeek)}</Text>
          <Text style={styles.cardSub}>/ {user.dailyGoalHours}h goal</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Compliance</Text>
          <Text style={styles.cardValue}>{compliance.toFixed(0)}%</Text>
          <Text style={styles.cardSub}>days meeting goal</Text>
        </View>
      </View>

      <BarChart data={daily} goalHours={user.dailyGoalHours} />
      <LineChart data={weekly} goalHours={user.dailyGoalHours} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#1a1a1a' },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  cardLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#007AFF' },
  cardSub: { fontSize: 12, color: '#999', marginTop: 4 },
});