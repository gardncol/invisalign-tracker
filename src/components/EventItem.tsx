import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import type { TrayEvent } from '../types';

interface EventItemProps {
  event: TrayEvent;
}

export function EventItem({ event }: EventItemProps) {
  const isOut = event.type === 'out';
  const isTrayChange = event.type === 'tray_change';
  const color = isOut ? '#FF3B30' : isTrayChange ? '#AF52DE' : '#34C759';
  const icon = isOut ? '📤' : isTrayChange ? '🦷' : '📥';
  const label = isOut ? 'Trays Out' : isTrayChange ? `Tray ${event.trayNumber}` : 'Trays In';

  return (
    <View style={styles.item}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {event.isEdited && <Text style={styles.edited}>edited</Text>}
      </View>
      <Text style={styles.time}>{format(new Date(event.timestamp), 'h:mm a')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 18 },
  content: { flex: 1 },
  label: { fontSize: 16, fontWeight: '500', color: '#1a1a1a' },
  edited: { fontSize: 12, color: '#999', marginTop: 2 },
  time: { fontSize: 16, color: '#666', fontWeight: '500' },
});