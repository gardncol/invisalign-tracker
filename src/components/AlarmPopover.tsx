import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import type { Theme } from '../utils/theme';

interface AlarmPopoverProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (delayMinutes: number) => void;
  onCancelAlarm?: () => void;
  thresholdMinutes: number;
  colors: Theme['colors'];
  editMode?: boolean;
}

const PRESET_DELAYS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: 'No alarm', value: 0 },
];

export function AlarmPopover({ visible, onClose, onConfirm, onCancelAlarm, thresholdMinutes, colors, editMode = false }: AlarmPopoverProps) {
  const defaultPreset = PRESET_DELAYS.find(d => d.value === thresholdMinutes) ?? PRESET_DELAYS[2];
  const [selected, setSelected] = useState(defaultPreset.value);
  const [useCustom, setUseCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  // Reset selection when popover opens
  useEffect(() => {
    if (visible) {
      const presetMatch = PRESET_DELAYS.find(d => d.value === thresholdMinutes);
      if (editMode && presetMatch) {
        setSelected(thresholdMinutes);
        setUseCustom(false);
      } else if (editMode) {
        // threshold doesn't match any preset — treat as custom
        setUseCustom(true);
        setCustomMinutes(String(thresholdMinutes));
        setSelected(-1);
      } else {
        setSelected(presetMatch?.value ?? 45);
        setUseCustom(false);
      }
      setCustomMinutes('');
    }
  }, [visible, editMode, thresholdMinutes]);

  const handlePresetSelect = (value: number) => {
    setSelected(value);
    setUseCustom(false);
  };

  const handleCustomFocus = () => {
    setUseCustom(true);
    setSelected(-1);
  };

  const handleConfirm = () => {
    if (useCustom) {
      const mins = parseInt(customMinutes) || 0;
      onConfirm(mins);
    } else {
      onConfirm(selected);
    }
    onClose();
  };

  const handleCancelAlarm = () => {
    onCancelAlarm?.();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {editMode ? '⏰ Adjust Alarm' : '⏰ Set Alarm'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {editMode
              ? 'Adjust or cancel the put-back-in reminder'
              : 'How long until we remind you to put trays back in?'}
          </Text>

          <View style={styles.options}>
            {PRESET_DELAYS.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.option,
                  {
                    borderColor: !useCustom && selected === preset.value ? colors.primary : colors.inputBorder,
                    backgroundColor: !useCustom && selected === preset.value ? colors.primary + '15' : 'transparent',
                  },
                ]}
                onPress={() => handlePresetSelect(preset.value)}
              >
                <Text style={[styles.optionText, { color: !useCustom && selected === preset.value ? colors.primary : colors.text }]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom duration input */}
          <Text style={[styles.customLabel, { color: colors.textSecondary }]}>Or set a custom duration (minutes):</Text>
          <TextInput
            style={[
              styles.customInput,
              {
                borderColor: useCustom ? colors.primary : colors.inputBorder,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            keyboardType="numeric"
            value={customMinutes}
            onChangeText={setCustomMinutes}
            onFocus={handleCustomFocus}
            placeholder="e.g., 25"
            placeholderTextColor={colors.textTertiary}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, { borderColor: colors.inputBorder }]} onPress={onClose}>
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Dismiss</Text>
            </TouchableOpacity>
            {editMode && onCancelAlarm && (
              <TouchableOpacity style={[styles.btn, { borderColor: colors.danger }]} onPress={handleCancelAlarm}>
                <Text style={[styles.btnText, { color: colors.danger }]}>Cancel Alarm</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
              <Text style={styles.btnTextWhite}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  content: { borderRadius: 16, padding: 24, width: '100%' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  option: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  optionText: { fontSize: 16, fontWeight: '600' },
  customLabel: { fontSize: 14, marginBottom: 8 },
  customInput: { fontSize: 16, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20 },
  buttons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center', minWidth: 100 },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnTextWhite: { color: '#fff', fontSize: 16, fontWeight: '600' },
});