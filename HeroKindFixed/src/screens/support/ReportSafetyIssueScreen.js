import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ISSUE_TYPES = [
  { key: 'unsafe', label: 'Unsafe behaviour', icon: 'warning-outline' },
  { key: 'harassment', label: 'Harassment or bullying', icon: 'chatbubble-ellipses-outline' },
  { key: 'scam', label: 'Scam or suspicious request', icon: 'shield-outline' },
  { key: 'item', label: 'Item not returned or damaged', icon: 'cube-outline' },
  { key: 'other', label: 'Something else', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function ReportSafetyIssueScreen({ navigation }) {
  const [issueType, setIssueType] = useState(null);
  const [person, setPerson] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = issueType && details.trim().length >= 10;

  const handleSubmit = () => {
    Alert.alert(
      'Submit safety report?',
      'HelpMate will review this report and may contact you for more details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => setSubmitted(true) },
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
          <Text style={styles.headerTitle}>Report Safety Issue</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="shield-checkmark" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Report submitted</Text>
          <Text style={styles.successBody}>
            Thanks for telling us. The HelpMate team will review this and follow up if more information is needed.
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
        <Text style={styles.headerTitle}>Report Safety Issue</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
            <Text style={styles.alertText}>
              If someone is in immediate danger, contact local emergency services first.
            </Text>
          </View>

          <Text style={styles.intro}>
            Tell us what happened. Reports are private and help keep the HelpMate community safe.
          </Text>

          <Text style={styles.label}>What happened?</Text>
          <View style={styles.card}>
            {ISSUE_TYPES.map((issue, idx) => {
              const selected = issueType === issue.key;
              const isLast = idx === ISSUE_TYPES.length - 1;
              return (
                <TouchableOpacity
                  key={issue.key}
                  style={[styles.issueRow, !isLast && styles.rowDivider, selected && styles.issueRowSelected]}
                  onPress={() => setIssueType(issue.key)}
                  activeOpacity={0.6}
                >
                  <View style={styles.issueLeft}>
                    <View style={[styles.issueIcon, selected && styles.issueIconSelected]}>
                      <Ionicons
                        name={issue.icon}
                        size={17}
                        color={selected ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <Text style={[styles.issueLabel, selected && styles.issueLabelSelected]}>
                      {issue.label}
                    </Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Who was involved? Optional</Text>
          <View style={[styles.card, styles.inputCard]}>
            <TextInput
              style={styles.singleInput}
              placeholder="Name, username, or chat details"
              placeholderTextColor={colors.textMuted}
              value={person}
              onChangeText={setPerson}
            />
          </View>

          <Text style={styles.label}>Details</Text>
          <View style={[styles.card, styles.textAreaCard]}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what happened, when it happened, and anything we should check."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={7}
              value={details}
              onChangeText={setDetails}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{details.trim().length} / 10 min</Text>
          </View>

          <View style={styles.notice}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
            <Text style={styles.noticeText}>
              The person you report will not be told who submitted the report.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.7}
          >
            <Ionicons name="send-outline" size={17} color={colors.textWhite} />
            <Text style={styles.submitBtnText}>Submit Report</Text>
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

  alertBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 16, marginTop: 18,
    borderRadius: 14,
    backgroundColor: colors.needLight,
    padding: 14,
  },
  alertText: { ...typography.smallBold, color: colors.error, flex: 1, lineHeight: 19 },
  intro: {
    ...typography.body, color: colors.textSecondary,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
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
  issueRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 50,
  },
  issueRowSelected: { backgroundColor: colors.primaryLight },
  issueLeft: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  issueIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background,
  },
  issueIconSelected: { backgroundColor: colors.card },
  issueLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  issueLabelSelected: { color: colors.primaryDark, fontWeight: '600' },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  inputCard: { paddingHorizontal: 14, paddingVertical: 4 },
  singleInput: { ...typography.body, color: colors.textPrimary, minHeight: 44 },
  textAreaCard: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  textArea: { ...typography.body, color: colors.textPrimary, minHeight: 130 },
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
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  successIcon: { marginBottom: 12 },
  successTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: 8 },
  successBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  doneBtnText: { ...typography.button, color: colors.textWhite },
});
