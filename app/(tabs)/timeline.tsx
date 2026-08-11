import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useEventStore } from '../../src/stores/useEventStore';
import { EventItem } from '../../src/components/EventItem';
import { format } from 'date-fns';
import type { TrayEvent } from '../../src/types';

export default function TimelineScreen() {
  const { getEventsForDay } = useEventStore();
  const [events, setEvents] = useState<TrayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date();
      const todays = await getEventsForDay(today);
      setEvents(todays);
      setLoading(false);
    })();
  }, [getEventsForDay]);

  const sorted = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{format(new Date(), 'EEEE, MMMM d')}</Text>
      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : sorted.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.empty}>No events yet today.</Text>
          <Text style={styles.emptySub}>Tap the toggle on the Today tab to start tracking.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <EventItem event={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 16 },
  header: { fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingBottom: 8, color: '#1a1a1a' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, color: '#666' },
  emptySub: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});