import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { format } from 'date-fns';
import { useState } from 'react';
import type { TrayEvent } from '../types';
import { useTheme } from '../utils/theme';

interface EventItemProps {
  event: TrayEvent;
  onEdit?: (event: TrayEvent, newTimestamp: Date) => void;
  onDelete?: (event: TrayEvent) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function EventItem({ event, onEdit, onDelete }: EventItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTime, setEditTime] = useState(format(event.timestamp, 'HH:mm'));

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
    const [hours, minutes] = editTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      Alert.alert('Invalid time', 'Use HH:mm format (e.g., 14:30)');
      return;
    }
    const newDate = new Date(event.timestamp);
    newDate.setHours(hours, minutes, 0, 0);
    onEdit?.(event, newDate);
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
      <TouchableOpacity style={styles.item} onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: getColor(event.type) + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          {event.isEdited && <Text style={styles.edited}>edited</Text>}
        </View>
        <Text style={styles.time}>{format(new Date(event.timestamp), 'h:mm a')}</Text>
      </TouchableOpacity>

      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(true)}>
              <Text style={styles.actionText}>✏️ Edit time</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>🗑 Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={editing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit time</Text>
            <Text style={styles.modalLabel}>{label} — {format(event.timestamp, 'EEEE, MMM d')}</Text>
            <Text style={styles.modalHint}>Enter new time (HH:mm, 24-hour format)</Text>
            <TextInput
              style={styles.timeInput}
              value={editTime}
              onChangeText={setEditTime}
              keyboardType="numeric"
              placeholder="14:30"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => { setEditing(false); setShowActions(false); }} color="#999" />
              <Button title="Save" onPress={handleSaveEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getColor(type: string): string {
  if (type === 'out') return '#FF3B30';
  if (type === 'tray_change') return '#AF52DE';
  return '#34C759';
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 18 },
  content: { flex: 1 },
  label: { fontSize: 16, fontWeight: '500', color: '#1a1a1a' },
  edited: { fontSize: 12, color: '#999', marginTop: 2 },
  time: { fontSize: 16, color: '#666', fontWeight: '500' },
  actions: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, gap: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee', backgroundColor: '#f9f9f9' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  actionText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#1a1a1a' },
  modalLabel: { fontSize: 16, color: '#666', marginBottom: 16 },
  modalHint: { fontSize: 14, color: '#999', marginBottom: 8 },
  timeInput: { fontSize: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});