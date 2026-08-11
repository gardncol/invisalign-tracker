import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '../src/stores/useOnboardingStore';
import { useUserStore } from '../src/stores/useUserStore';
import { COMMON_CHANGE_FREQUENCIES, MIN_GOAL_HOURS, MAX_GOAL_HOURS } from '../src/utils/constants';

export default function OnboardingScreen() {
  const router = useRouter();
  const { step, data, setTotalTrays, setChangeFrequency, setCurrentTray, setDailyGoalHours, nextStep, prevStep } = useOnboardingStore();
  const { completeOnboarding } = useUserStore();
  const [customFreq, setCustomFreq] = useState('');

  const handleFinish = async () => {
    await completeOnboarding(data);
    router.replace('/(tabs)');
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.totalTrays > 0;
      case 1: return data.changeFrequencyDays > 0;
      case 2: return data.currentTray > 0 && data.currentTray <= data.totalTrays;
      case 3: return data.dailyGoalHours >= MIN_GOAL_HOURS && data.dailyGoalHours <= MAX_GOAL_HOURS;
      default: return false;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.step}>
          <Text style={styles.title}>How many trays total?</Text>
          <Text style={styles.subtitle}>Your orthodontist prescribed this number</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={data.totalTrays ? String(data.totalTrays) : ''}
            onChangeText={(v) => setTotalTrays(parseInt(v) || 0)}
            placeholder="e.g., 24"
            autoFocus
          />
        </View>
      )}

      {step === 1 && (
        <View style={styles.step}>
          <Text style={styles.title}>How often do you change trays?</Text>
          <Text style={styles.subtitle}>Days per tray</Text>
          {COMMON_CHANGE_FREQUENCIES.map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[styles.option, data.changeFrequencyDays === freq && styles.optionSelected]}
              onPress={() => setChangeFrequency(freq)}
            >
              <Text style={styles.optionText}>Every {freq} days</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Custom:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={customFreq}
              onChangeText={(v) => {
                setCustomFreq(v);
                setChangeFrequency(parseInt(v) || 0);
              }}
              placeholder="days"
            />
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.step}>
          <Text style={styles.title}>What tray are you on?</Text>
          <Text style={styles.subtitle}>Current tray number (out of {data.totalTrays})</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={data.currentTray ? String(data.currentTray) : ''}
            onChangeText={(v) => setCurrentTray(parseInt(v) || 0)}
            placeholder="e.g., 1"
            autoFocus
          />
        </View>
      )}

      {step === 3 && (
        <View style={styles.step}>
          <Text style={styles.title}>What's your daily goal?</Text>
          <Text style={styles.subtitle}>Hours per day (recommended: 22)</Text>
          <Text style={styles.goalDisplay}>{data.dailyGoalHours} hours</Text>
          <View style={styles.sliderContainer}>
            {Array.from({ length: MAX_GOAL_HOURS - MIN_GOAL_HOURS + 1 }, (_, i) => MIN_GOAL_HOURS + i).map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hourPill, data.dailyGoalHours === h && styles.hourPillSelected]}
                onPress={() => setDailyGoalHours(h)}
              >
                <Text style={styles.hourPillText}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.nav}>
        {step > 0 && (
          <TouchableOpacity style={styles.btnSecondary} onPress={prevStep}>
            <Text style={styles.btnSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.btnPrimary, !canProceed() && styles.btnDisabled]}
            onPress={nextStep}
            disabled={!canProceed()}
          >
            <Text style={styles.btnPrimaryText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimary, !canProceed() && styles.btnDisabled]}
            onPress={handleFinish}
            disabled={!canProceed()}
          >
            <Text style={styles.btnPrimaryText}>Start Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#007AFF' },
  step: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  input: { fontSize: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16 },
  smallInput: { fontSize: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, width: 80 },
  option: { padding: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginBottom: 12 },
  optionSelected: { borderColor: '#007AFF', backgroundColor: '#f0f7ff' },
  optionText: { fontSize: 18 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  customLabel: { fontSize: 16 },
  goalDisplay: { fontSize: 48, fontWeight: '800', textAlign: 'center', marginVertical: 24, color: '#007AFF' },
  sliderContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  hourPill: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  hourPillSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  hourPillText: { fontSize: 16, fontWeight: '600' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 },
  btnPrimary: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, flex: 1, marginLeft: 8 },
  btnPrimaryText: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  btnSecondary: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16 },
  btnSecondaryText: { fontSize: 18, color: '#666' },
  btnDisabled: { opacity: 0.4 },
});