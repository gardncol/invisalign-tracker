import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useEventStore } from '../../src/stores/useEventStore';
import { useUserStore } from '../../src/stores/useUserStore';
import { EventItem } from '../../src/components/EventItem';
import { format, addDays, subDays, isToday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import type { TrayEvent } from '../../src/types';
import { useTheme } from '../../src/utils/theme';
import { calculateWearTime } from '../../src/services/timeCalculator';
import { formatHours } from '../../src/utils/dates';

export default function TimelineScreen() {
  const { getEventsForDay, editEventTimestamp, removeEvent } = useEventStore();
  const { user } = useUserStore();
  const { colors } = useTheme(user?.themePreference);
  const [events, setEvents] = useState<TrayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadEvents = useCallback(async (date: Date) => {
    setLoading(true);
    const dayEvents = await getEventsForDay(date);
    setEvents(dayEvents);
    setLoading(false);
  }, [getEventsForDay]);

  useEffect(() => {
    loadEvents(selectedDate);
  }, [selectedDate, loadEvents]);

  const sorted = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const wornHours = calculateWearTime(sorted);

  const handleEdit = async (event: TrayEvent, newTimestamp: Date) => {
    await editEventTimestamp(event.id, newTimestamp);
    loadEvents(selectedDate);
  };

  const handleDelete = async (event: TrayEvent) => {
    await removeEvent(event.id);
    loadEvents(selectedDate);
  };

  const goPrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goNextDay = () => {
    if (!isToday(selectedDate)) setSelectedDate(addDays(selectedDate, 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={goPrevDay} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>
          {format(selectedDate, 'EEEE, MMMM d')}
        </Text>
        <TouchableOpacity onPress={goNextDay} style={styles.navBtn} disabled={isToday(selectedDate)}>
          <Ionicons name="chevron-forward" size={24} color={isToday(selectedDate) ? colors.textTertiary : colors.primary} />
        </TouchableOpacity>
      </View>

      {sorted.length > 0 && (
        <Text style={[styles.wornSummary, { color: colors.textSecondary }]}>
          Total worn: {formatHours(wornHours)}
        </Text>
      )}

      {loading ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Loading...</Text>
      ) : sorted.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No events on this day.
          </Text>
          <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
            {isToday(selectedDate)
              ? 'Tap the toggle on the Today tab to start tracking.'
              : 'Swipe to another day to view history.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventItem event={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 8 },
  navBtn: { padding: 8 },
  header: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  wornSummary: { fontSize: 14, textAlign: 'center', marginBottom: 8, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});