import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEventStore } from '../../src/stores/useEventStore';
import { useUserStore } from '../../src/stores/useUserStore';
import { EventItem } from '../../src/components/EventItem';
import { format, addDays, subDays, isToday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import type { TrayEvent, EventType } from '../../src/types';
import { useTheme } from '../../src/utils/theme';
import { calculateWearTime } from '../../src/services/timeCalculator';
import { formatHours } from '../../src/utils/dates';

export default function TimelineScreen() {
  const todaysEvents = useEventStore((s) => s.todaysEvents);
  const getEventsForDay = useEventStore((s) => s.getEventsForDay);
  const editEventTimestamp = useEventStore((s) => s.editEventTimestamp);
  const removeEvent = useEventStore((s) => s.removeEvent);
  const addEvent = useEventStore((s) => s.addEvent);
  const user = useUserStore((s) => s.user);
  const { colors } = useTheme(user?.themePreference);
  const [events, setEvents] = useState<TrayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<EventType>('in');
  const [addTime, setAddTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [addTrayNumber, setAddTrayNumber] = useState('');

  const loadEvents = useCallback(async (date: Date) => {
    setLoading(true);
    const dayEvents = await getEventsForDay(date);
    setEvents(dayEvents);
    setLoading(false);
  }, [getEventsForDay]);

  useEffect(() => {
    loadEvents(selectedDate);
  }, [selectedDate, loadEvents]);

  // When viewing today, also re-load whenever the store's todaysEvents changes
  // (e.g., when user taps the toggle on the Today tab)
  useEffect(() => {
    if (isToday(selectedDate)) {
      // Use the store's todaysEvents directly — they're already loaded and sorted
      setEvents(todaysEvents);
      setLoading(false);
    }
  }, [todaysEvents, selectedDate]);

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

  const handleAddEvent = async () => {
    const eventDate = new Date(selectedDate);
    eventDate.setHours(addTime.getHours(), addTime.getMinutes(), 0, 0);
    if (addType === 'tray_change') {
      const trayNum = parseInt(addTrayNumber) || (user ? user.currentTray : 1);
      await addEvent('tray_change', eventDate, trayNum);
    } else {
      await addEvent(addType, eventDate);
    }
    setShowAddModal(false);
    setShowTimePicker(false);
    setAddTrayNumber('');
    loadEvents(selectedDate);
  };

  const openAddModal = () => {
    setAddTime(new Date());
    setAddType('in');
    setShowTimePicker(false);
    setAddTrayNumber('');
    setShowAddModal(true);
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

      <View style={styles.actionRow}>
        {sorted.length > 0 && (
          <Text style={[styles.wornSummary, { color: colors.textSecondary }]}>
            Total worn: {formatHours(wornHours)}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Event</Text>
        </TouchableOpacity>
      </View>

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
              ? 'Tap the toggle on the Today tab or add an event here.'
              : 'Swipe to another day or add a missed event.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventItem event={item} onEdit={handleEdit} onDelete={handleDelete} colors={colors} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Add Event Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Missed Event</Text>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </Text>

            {/* Event type selector */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeOption, { borderColor: addType === 'in' ? colors.success : colors.inputBorder }, addType === 'in' && { backgroundColor: colors.success + '15' }]}
                onPress={() => setAddType('in')}
              >
                <Text style={[styles.typeText, { color: addType === 'in' ? colors.success : colors.textSecondary }]}>📥 Trays In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, { borderColor: addType === 'out' ? colors.danger : colors.inputBorder }, addType === 'out' && { backgroundColor: colors.danger + '15' }]}
                onPress={() => setAddType('out')}
              >
                <Text style={[styles.typeText, { color: addType === 'out' ? colors.danger : colors.textSecondary }]}>📤 Trays Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, { borderColor: addType === 'tray_change' ? colors.primary : colors.inputBorder }, addType === 'tray_change' && { backgroundColor: colors.primary + '15' }]}
                onPress={() => setAddType('tray_change')}
              >
                <Text style={[styles.typeText, { color: addType === 'tray_change' ? colors.primary : colors.textSecondary }]}>🦷 Change Tray</Text>
              </TouchableOpacity>
            </View>

            {/* Tray number input — only shown for tray_change events */}
            {addType === 'tray_change' && (
              <View style={styles.trayNumberSection}>
                <Text style={[styles.modalHint, { color: colors.textTertiary }]}>Tray number</Text>
                <TextInput
                  style={[styles.trayNumberInput, { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.background }]}
                  keyboardType="numeric"
                  value={addTrayNumber}
                  onChangeText={setAddTrayNumber}
                  placeholder={String(user?.currentTray ?? 1)}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            )}

            {/* Time selector — collapsed by default, tap to reveal */}
            <TouchableOpacity
              style={[styles.timeSelectorBtn, { borderColor: colors.inputBorder, backgroundColor: colors.background }]}
              onPress={() => setShowTimePicker(!showTimePicker)}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.timeSelectorText, { color: colors.text }]}>
                {format(addTime, 'h:mm a')}
              </Text>
              <Ionicons name={showTimePicker ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={addTime}
                mode="time"
                display="spinner"
                onChange={(e, selected) => { if (selected) setAddTime(selected); }}
                textColor={colors.text}
                style={{ alignSelf: 'center', width: '100%', marginBottom: 16 }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: colors.inputBorder }]} onPress={() => { setShowAddModal(false); setShowTimePicker(false); }}>
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleAddEvent}>
                <Text style={styles.modalBtnTextWhite}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 4 },
  navBtn: { padding: 8 },
  header: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  wornSummary: { fontSize: 14, fontWeight: '500' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  modalContent: { borderRadius: 16, padding: 24, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  modalLabel: { fontSize: 16, marginBottom: 16 },
  modalHint: { fontSize: 14, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeOption: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center', minWidth: 100 },
  typeText: { fontSize: 14, fontWeight: '600' },
  trayNumberSection: { marginBottom: 16 },
  trayNumberInput: { fontSize: 16, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  timeSelectorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16 },
  timeSelectorText: { fontSize: 16, fontWeight: '600', flex: 1, marginLeft: 8 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  modalBtnTextWhite: { color: '#fff', fontSize: 16, fontWeight: '600' },
});