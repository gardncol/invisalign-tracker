import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useUserStore } from '../../src/stores/useUserStore';
import { useTheme } from '../../src/utils/theme';
import { MIN_GOAL_HOURS, MAX_GOAL_HOURS } from '../../src/utils/constants';
import type { UserProfile, ThemePreference } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsScreen() {
  const { user, updateProfile } = useUserStore();
  const { colors } = useTheme(user?.themePreference);
  const [goalHours, setGoalHours] = useState(String(user?.dailyGoalHours ?? 22));
  const [awakeStart, setAwakeStart] = useState(user?.awakeStart ?? '07:00');
  const [awakeEnd, setAwakeEnd] = useState(user?.awakeEnd ?? '22:00');
  const [trayChangeTime, setTrayChangeTime] = useState(user?.trayChangeTime ?? '22:00');
  const [trayChangeDay, setTrayChangeDay] = useState(user?.trayChangeDay ?? -1);
  const [notificationsOn, setNotificationsOn] = useState(user?.notificationsEnabled ?? true);
  const [alarmsOn, setAlarmsOn] = useState(user?.alarmsEnabled ?? true);
  const [alarmThreshold, setAlarmThreshold] = useState(String(user?.alarmThresholdMinutes ?? 45));
  const [themePref, setThemePref] = useState<ThemePreference>(user?.themePreference ?? 'system');

  if (!user) return null;

  const handleSave = async () => {
    const updates: Partial<UserProfile> = {
      dailyGoalHours: parseFloat(goalHours),
      awakeStart,
      awakeEnd,
      trayChangeTime,
      trayChangeDay,
      notificationsEnabled: notificationsOn,
      alarmsEnabled: alarmsOn,
      alarmThresholdMinutes: parseInt(alarmThreshold) || 45,
      themePreference: themePref,
    };
    await updateProfile(updates);
    Alert.alert('Saved', 'Your settings have been updated.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      {/* Appearance */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.themeRow}>
          {(['system', 'light', 'dark'] as ThemePreference[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.themeOption,
                { borderColor: themePref === t ? colors.primary : colors.inputBorder },
                themePref === t && { backgroundColor: colors.primary + '15' },
              ]}
              onPress={() => setThemePref(t)}
            >
              <Ionicons
                name={t === 'system' ? 'phone-portrait' : t === 'light' ? 'sunny' : 'moon'}
                size={20}
                color={themePref === t ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.themeText, { color: themePref === t ? colors.primary : colors.textSecondary }]}>
                {t === 'system' ? 'Auto' : t === 'light' ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Goal */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Goal</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Goal hours per day ({MIN_GOAL_HOURS}–{MAX_GOAL_HOURS})</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={goalHours}
          onChangeText={setGoalHours}
        />
      </View>

      {/* Awake Hours */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Awake Hours</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Start (HH:mm)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.background }]}
          value={awakeStart}
          onChangeText={setAwakeStart}
          placeholder="07:00"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>End (HH:mm)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.background }]}
          value={awakeEnd}
          onChangeText={setAwakeEnd}
          placeholder="22:00"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      {/* Tray Change */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tray Change</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Reminder time (HH:mm)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.background }]}
          value={trayChangeTime}
          onChangeText={setTrayChangeTime}
          placeholder="22:00"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>Change day (optional)</Text>
        <Text style={[styles.hint, { color: colors.textTertiary }]}>Pick a day of the week, or "Any" for no preference</Text>
        <View style={styles.dayRow}>
          <TouchableOpacity
            style={[styles.dayPill, { borderColor: trayChangeDay === -1 ? colors.primary : colors.inputBorder }, trayChangeDay === -1 && { backgroundColor: colors.primary + '15' }]}
            onPress={() => setTrayChangeDay(-1)}
          >
            <Text style={[styles.dayPillText, { color: trayChangeDay === -1 ? colors.primary : colors.textSecondary }]}>Any</Text>
          </TouchableOpacity>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayPill, { borderColor: trayChangeDay === i ? colors.primary : colors.inputBorder }, trayChangeDay === i && { backgroundColor: colors.primary + '15' }]}
              onPress={() => setTrayChangeDay(i)}
            >
              <Text style={[styles.dayPillText, { color: trayChangeDay === i ? colors.primary : colors.textSecondary }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Tray change reminders</Text>
          <Switch value={notificationsOn} onValueChange={setNotificationsOn} />
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Put-back-in alarms</Text>
          <Switch value={alarmsOn} onValueChange={setAlarmsOn} />
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Alarm threshold (minutes out)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={alarmThreshold}
          onChangeText={setAlarmThreshold}
        />
        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          If trays are out longer than this, you'll get a notification to put them back in.
        </Text>
      </View>

      {/* Treatment Info */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Treatment Info</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Total trays: {user.totalTrays}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Change every: {user.changeFrequencyDays} days</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Current tray: {user.currentTray}</Text>
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  section: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 8 },
  hint: { fontSize: 12, marginBottom: 8 },
  input: { fontSize: 16, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5 },
  infoText: { fontSize: 16, marginBottom: 4 },
  saveBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10 },
  themeText: { fontSize: 14, fontWeight: '500' },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayPill: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  dayPillText: { fontSize: 14, fontWeight: '500' },
});