import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEventStore } from '../../src/stores/useEventStore';
import { getDailySummaries, getWeeklySummaries, getOverallCompliance } from '../../src/services/reporting';
import { BarChart } from '../../src/components/BarChart';
import { LineChart } from '../../src/components/LineChart';
import { formatHours } from '../../src/utils/dates';
import { useTheme } from '../../src/utils/theme';
import type { DaySummary, WeekSummary } from '../../src/types';

export default function ReportsScreen() {
  const user = useUserStore((s) => s.user);
  const getEventsForRange = useEventStore((s) => s.getEventsForRange);
  const { colors } = useTheme(user?.themePreference);
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
    <ScrollView style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <Text style={[styles.header, { color: colors.text }]}>Reports</Text>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>This Week Avg</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>{formatHours(avgThisWeek)}</Text>
          <Text style={[styles.cardSub, { color: colors.textTertiary }]}>/ {user.dailyGoalHours}h goal</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Compliance</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>{compliance.toFixed(0)}%</Text>
          <Text style={[styles.cardSub, { color: colors.textTertiary }]}>days meeting goal</Text>
        </View>
      </View>

      <BarChart data={daily} goalHours={user.dailyGoalHours} colors={colors} />
      <LineChart data={weekly} goalHours={user.dailyGoalHours} colors={colors} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { flex: 1, borderRadius: 12, padding: 16 },
  cardLabel: { fontSize: 14, marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: '800' },
  cardSub: { fontSize: 12, marginTop: 4 },
});