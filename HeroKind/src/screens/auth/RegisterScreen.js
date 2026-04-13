import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const STEPS = ['Account', 'Profile', 'Verify'];

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', neighbourhood: '', studentEmail: '',
  });

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else navigation.replace('Onboarding');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => step === 0 ? navigation.goBack() : setStep(s => s - 1)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.progressStep}>
                <View style={[styles.progressDot, i <= step && styles.progressDotActive]}>
                  <Text style={[styles.progressNum, i <= step && styles.progressNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[styles.progressLabel, i === step && styles.progressLabelActive]}>{s}</Text>
                {i < STEPS.length - 1 && (
                  <View style={[styles.progressLine, i < step && styles.progressLineActive]} />
                )}
              </View>
            ))}
          </View>

          {/* Card */}
          <View style={styles.card}>
            {step === 0 && (
              <>
                <Text style={styles.cardTitle}>Create account</Text>
                <Text style={styles.cardSub}>Set up your login credentials</Text>

                <Text style={styles.label}>Email address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={form.email}
                  onChangeText={v => setForm(f => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={form.password}
                  onChangeText={v => setForm(f => ({ ...f, password: v }))}
                />

                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={form.confirmPassword}
                  onChangeText={v => setForm(f => ({ ...f, confirmPassword: v }))}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Text style={styles.cardTitle}>Your profile</Text>
                <Text style={styles.cardSub}>How you'll appear to neighbours</Text>

                <Text style={styles.label}>Display name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex C."
                  placeholderTextColor={colors.textMuted}
                  value={form.name}
                  onChangeText={v => setForm(f => ({ ...f, name: v }))}
                />

                <Text style={styles.label}>Your neighbourhood / suburb</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Carlton North"
                  placeholderTextColor={colors.textMuted}
                  value={form.neighbourhood}
                  onChangeText={v => setForm(f => ({ ...f, neighbourhood: v }))}
                />

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    📍 We only store your suburb, never your exact address.
                  </Text>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.cardTitle}>Verify your identity</Text>
                <Text style={styles.cardSub}>Optional but builds community trust</Text>

                <View style={styles.verifyCard}>
                  <Text style={styles.verifyEmoji}>🎓</Text>
                  <Text style={styles.verifyTitle}>Student verification</Text>
                  <Text style={styles.verifyDesc}>
                    Add your university email to get a verified checkmark badge on your profile.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@student.unimelb.edu.au"
                    placeholderTextColor={colors.textMuted}
                    value={form.studentEmail}
                    onChangeText={v => setForm(f => ({ ...f, studentEmail: v }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}

            {/* CTA */}
            <TouchableOpacity style={styles.primaryBtn} onPress={next}>
              <Text style={styles.primaryBtnText}>
                {step === STEPS.length - 1 ? 'Set up avatar →' : 'Continue →'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingBottom: 40 },

  backBtn: { padding: 16 },
  backText: { ...typography.body, color: colors.primary },

  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    marginBottom: 24,
    gap: 0,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressNum: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  progressNumActive: { color: colors.textWhite },
  progressLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  progressLabelActive: { color: colors.primary, fontWeight: '600' },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  progressLineActive: { backgroundColor: colors.primary },

  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: 4 },
  cardSub: { ...typography.body, color: colors.textSecondary, marginBottom: 24 },

  label: { ...typography.smallBold, color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  infoText: { ...typography.small, color: colors.primary },

  verifyCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyEmoji: { fontSize: 36, marginBottom: 8 },
  verifyTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  verifyDesc: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },

  skipBtn: { alignSelf: 'center', marginBottom: 16 },
  skipText: { ...typography.small, color: colors.textMuted, textDecorationLine: 'underline' },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { ...typography.button, color: colors.textWhite },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginPrompt: { ...typography.body, color: colors.textSecondary },
  loginLink: { ...typography.bodyBold, color: colors.primary },
});
