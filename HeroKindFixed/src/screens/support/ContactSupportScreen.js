import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const SUBJECTS = [
  { key: 'account',    label: '👤  Account & Login' },
  { key: 'exchange',   label: '🤝  Exchange Issue' },
  { key: 'safety',     label: '🛡️  Safety Concern' },
  { key: 'bug',        label: '🐛  Bug Report' },
  { key: 'suggestion', label: '💡  Feature Suggestion' },
  { key: 'other',      label: '📬  Other' },
];

export default function ContactSupportScreen({ navigation }) {
  const [subject, setSubject] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = subject && message.trim().length >= 10;

  const handleSubmit = () => {
    Alert.alert(
      'Submit request?',
      'Our team will get back to you within 24 hours at your registered email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => setSubmitted(true),
        },
      ]
    );
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Support</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Message sent!</Text>
          <Text style={styles.successBody}>
            Thanks for reaching out. Our support team will reply within 24 hours to your registered email address.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Back to Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            We're here to help. Tell us what's going on and we'll get back to you within 24 hours.
          </Text>

          {/* Subject */}
          <Text style={styles.label}>What's this about?</Text>
          <View style={styles.card}>
            {SUBJECTS.map((s, idx) => {
              const selected = subject === s.key;
              const isLast = idx === SUBJECTS.length - 1;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.subjectRow, !isLast && styles.rowDivider, selected && styles.subjectRowSelected]}
                  onPress={() => setSubject(s.key)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.subjectLabel, selected && styles.subjectLabelSelected]}>
                    {s.label}
                  </Text>
                  {selected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message */}
          <Text style={styles.label}>Describe your issue</Text>
          <View style={[styles.card, styles.textAreaCard]}>
            <TextInput
              style={styles.textArea}
              placeholder="Please provide as much detail as possible…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{message.trim().length} / 10 min</Text>
          </View>

          {/* Info notice */}
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.noticeText}>
              Your report is sent to the HeroKind team only. We never share your details with other users.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.7}
          >
            <Ionicons name="send-outline" size={17} color={colors.textWhite} />
            <Text style={styles.submitBtnText}>Send Message</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 48 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  intro: {
    ...typography.body, color: colors.textSecondary,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4,
  },

  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8,
  },

  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 1,
  },
  textAreaCard: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },

  subjectRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13, minHeight: 48,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  subjectRowSelected: { backgroundColor: colors.primaryLight },
  subjectLabel: { ...typography.body, color: colors.textPrimary },
  subjectLabelSelected: { color: colors.primaryDark, fontWeight: '600' },

  textArea: {
    ...typography.body, color: colors.textPrimary,
    minHeight: 120,
  },
  charCount: { ...typography.caption, color: colors.textMuted, textAlign: 'right', paddingTop: 4 },

  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 20, marginTop: 16,
  },
  noticeText: { ...typography.small, color: colors.textMuted, flex: 1 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: 16, marginTop: 24,
    borderRadius: 14, paddingVertical: 15,
  },
  submitBtnDisabled: { backgroundColor: colors.border },
  submitBtnText: { ...typography.button, color: colors.textWhite },

  // Success state
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: { marginBottom: 16 },
  successTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: 12 },
  successBody: {
    ...typography.body, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  doneBtn: {
    marginTop: 32, backgroundColor: colors.primary,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12,
  },
  doneBtnText: { ...typography.button, color: colors.textWhite },
});
