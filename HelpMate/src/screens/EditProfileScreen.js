import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { profile, patchProfile } = useAuth();

  const [name, setName] = useState(profile?.name ?? '');
  const [neighbourhood, setNeighbourhood] = useState(profile?.neighbourhood ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    await patchProfile({ name: name.trim(), neighbourhood: neighbourhood.trim(), bio: bio.trim() });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={save} disabled={saving} style={styles.saveBtn}>
            <Text style={[styles.saveBtnText, saving && { opacity: 0.5 }]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Neighbourhood</Text>
            <TextInput
              style={styles.input}
              value={neighbourhood}
              onChangeText={setNeighbourhood}
              placeholder="e.g. Carlton North"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell your neighbours a bit about yourself…"
              placeholderTextColor={colors.textMuted}
              multiline
              returnKeyType="done"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  saveBtn: { padding: 4 },
  saveBtnText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  body: { padding: 20, gap: 24 },
  field: { gap: 8 },
  label: { ...typography.small, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.body,
    color: colors.textPrimary,
  },
  bioInput: { height: 120, textAlignVertical: 'top' },
});
