import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../src/stores/useUserStore';
import { MIN_GOAL_HOURS, MAX_GOAL_HOURS } from '../../src/utils/constants';
import type { UserProfile } from '../../src/types';

export default function SettingsScreen() {
  const { user, updateProfile } = useUserStore();
  const [goalHours, setGoalHours] = useState(String(user?.dailyGoalHours ?? 22));
  const [awakeStart, setAwakeStart] = useState(user?.awakeStart ?? '07:00');
  const [awakeEnd, setAwakeEnd] = useState(user?.awakeEnd ?? '22:00');
  const [trayChangeTime, setTrayChangeTime] = useState(user?.trayChangeTime ?? '22:00');
  const [notificationsOn, setNotificationsOn] = useState(user?.notificationsEnabled ?? true);
  const [alarmThreshold, setAlarmThreshold] = useState(String(user?.alarmThresholdMinutes ?? 45));

  if (!user) return null;

  const handleSave = async () => {
    const updates: Partial<UserProfile> = {
      dailyGoalHours: parseFloat(goalHours),
      awakeStart,
      awakeEnd,
      trayChangeTime,
      notificationsEnabled: notificationsOn,
      alarmThresholdMinutes: parseInt(alarmThreshold) || 45,
    };
    await updateProfile(updates);
    Alert.alert('Saved', 'Your settings have been updated.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Goal</Text>
        <Text style={styles.label}>Goal hours per day ({MIN_GOAL_HOURS}–{MAX_GOAL_HOURS})</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={goalHours} onChangeText={setGoalHours} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Awake Hours</Text>
        <Text style={styles.label}>Start (HH:mm)</Text>
        <TextInput style={styles.input} value={awakeStart} onChangeText={setAwakeStart} placeholder="07:00" />
        <Text style={styles.label}>End (HH:mm)</Text>
        <TextInput style={styles.input} value={awakeEnd} onChangeText={setAwakeEnd} placeholder="22:00" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tray Change</Text>
        <Text style={styles.label}>Reminder time (HH:mm)</Text>
        <TextInput style={styles.input} value={trayChangeTime} onChangeText={setTrayChangeTime} placeholder="22:00" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable notifications</Text>
          <Switch value={notificationsOn} onValueChange={setNotificationsOn} />
        </View>
        <Text style={styles.label}>Alarm threshold (minutes out)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={alarmThreshold} onChangeText={setAlarmThreshold} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treatment Info</Text>
        <Text style={styles.infoText}>Total trays: {user.totalTrays}</Text>
        <Text style={styles.infoText}>Change every: {user.changeFrequencyDays} days</Text>
        <Text style={styles.infoText}>Current tray: {user.currentTray}</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 16, color: '#1a1a1a' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1a1a1a' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { fontSize: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, color: '#333', marginBottom: 4 },
  saveBtn: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});