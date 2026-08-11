import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Button } from 'react-native';
import { format } from 'date-fns';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { TrayEvent } from '../types';
import type { Theme } from '../utils/theme';

interface EventItemProps {
  event: TrayEvent;
  onEdit?: (event: TrayEvent, newTimestamp: Date) => void;
  onDelete?: (event: TrayEvent) => void;
  colors: Theme['colors'];
}

export function EventItem({ event, onEdit, onDelete, colors }: EventItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date(event.timestamp));

  const isOut = event.type === 'out';
  const isTrayChange = event.type === 'tray_change';
  const icon = isOut ? '📤' : isTrayChange ? '🦷' : '📥';
  const label = isOut ? 'Trays Out' : isTrayChange ? `Tray ${event.trayNumber}` : 'Trays In';

  const handlePress = () => {
    if (onEdit || onDelete) {
      setShowActions(!showActions);
    }
  };

  const handleSaveEdit = () => {
    onEdit?.(event, pickerDate);
    setEditing(false);
    setShowActions(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete event?',
      `Remove "${label}" at ${format(event.timestamp, 'h:mm a')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.(event);
            setShowActions(false);
          },
        },
      ]
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.item, { borderBottomColor: colors.border }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: getColor(event.type) + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {event.isEdited && <Text style={[styles.edited, { color: colors.textTertiary }]}>edited</Text>}
        </View>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{format(new Date(event.timestamp), 'h:mm a')}</Text>
      </TouchableOpacity>

      {showActions && (
        <View style={[styles.actions, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setPickerDate(new Date(event.timestamp)); setEditing(true); }}>
              <Text style={[styles.actionText, { color: colors.primary }]}>✏️ Edit time</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Text style={[styles.actionText, { color: colors.danger }]}>🗑 Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {editing && (
        <Modal visible={editing} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit time</Text>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                {label} — {format(event.timestamp, 'EEEE, MMM d')}
              </Text>
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="spinner"
                onChange={(e, selected) => {
                  if (selected) setPickerDate(selected);
                }}
                textColor={colors.text}
                style={{ alignSelf: 'center', marginBottom: 16 }}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => { setEditing(false); setShowActions(false); }} color="#999" />
                <Button title="Save" onPress={handleSaveEdit} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function getColor(type: string): string {
  if (type === 'out') return '#FF3B30';
  if (type === 'tray_change') return '#AF52DE';
  return '#34C759';
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 18 },
  content: { flex: 1 },
  label: { fontSize: 16, fontWeight: '500' },
  edited: { fontSize: 12, marginTop: 2 },
  time: { fontSize: 16, fontWeight: '500' },
  actions: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, gap: 16, borderBottomWidth: 0.5 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  actionText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  modalContent: { borderRadius: 16, padding: 24, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  modalLabel: { fontSize: 16, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});