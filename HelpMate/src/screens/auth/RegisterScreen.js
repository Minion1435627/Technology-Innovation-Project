import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// Match CoverScreen palette
const GREEN      = '#86A778';
const GREEN_DARK = '#41503C';
const PAPER      = '#F4F0EA';
const GREEN_LIGHT = '#E4EFD8';

const STEPS = ['Account', 'Profile', 'Verify'];

export default function RegisterScreen({ navigation }) {
  const { fetchProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', neighbourhood: '', gender: '', bio: '', studentEmail: '',
  });

  const GENDERS = ['Male', 'Female', 'Non-binary'];

  const validate = () => {
    if (step === 0) {
      if (!form.email.trim()) return 'Email is required.';
      if (!form.password) return 'Password is required.';
      if (form.password.length < 8) return 'Password must be at least 8 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 1) {
      if (!form.name.trim()) return 'Display name is required.';
      if (!form.neighbourhood.trim()) return 'Neighbourhood is required.';
      if (!form.gender) return 'Please select a gender.';
    }
    return null;
  };

  const next = async () => {
    const error = validate();
    if (error) { Alert.alert('Missing info', error); return; }

    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }

    // Final step — create account
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: null },
    });

    if (signUpError) {
      setLoading(false);
      Alert.alert('Registration failed', signUpError.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      Alert.alert('Check your email', 'A confirmation link was sent. Please disable email confirmation in Supabase for mobile testing.');
      return;
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: form.email,
        name: form.name,
        neighbourhood: form.neighbourhood,
        gender: form.gender,
        bio: form.bio || null,
        verified: !!form.studentEmail,
      });

    setLoading(false);

    if (profileError) {
      Alert.alert('Profile error', profileError.message);
      return;
    }

    await fetchProfile(data.user.id);
    navigation.replace('Onboarding');
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

                <Text style={styles.label}>Display name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex C."
                  placeholderTextColor={colors.textMuted}
                  value={form.name}
                  onChangeText={v => setForm(f => ({ ...f, name: v }))}
                />

                <Text style={styles.label}>Neighbourhood / suburb <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Carlton North"
                  placeholderTextColor={colors.textMuted}
                  value={form.neighbourhood}
                  onChangeText={v => setForm(f => ({ ...f, neighbourhood: v }))}
                />

                <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
                <View style={styles.genderRow}>
                  {GENDERS.map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderOption, form.gender === g && styles.genderOptionActive]}
                      onPress={() => setForm(f => ({ ...f, gender: g }))}
                    >
                      <Text style={[styles.genderOptionText, form.gender === g && styles.genderOptionTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Bio <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell neighbours a little about yourself…"
                  placeholderTextColor={colors.textMuted}
                  value={form.bio}
                  onChangeText={v => setForm(f => ({ ...f, bio: v }))}
                  multiline
                  maxLength={160}
                />
                <Text style={styles.charCount}>{form.bio.length}/160</Text>

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
                <View style={styles.unavailableNotice}>
                  <Text style={styles.unavailableText}>⚠ This feature is not available yet</Text>
                </View>

                <TouchableOpacity style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}

            {/* CTA */}
            <TouchableOpacity style={styles.primaryBtn} onPress={next} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>
                    {step === STEPS.length - 1 ? 'Set up avatar →' : 'Continue →'}
                  </Text>
              }
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
  safe: { flex: 1, backgroundColor: PAPER },
  container: { flexGrow: 1, paddingBottom: 40 },

  backBtn: { padding: 16 },
  backText: { ...typography.body, color: GREEN },

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
  progressDotActive: { backgroundColor: GREEN },
  progressNum: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  progressNumActive: { color: '#fff' },
  progressLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  progressLabelActive: { color: GREEN_DARK, fontWeight: '600' },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  progressLineActive: { backgroundColor: GREEN },

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
    lineHeight: undefined,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  required: { color: '#e03131' },
  optional: { color: colors.textMuted, fontWeight: '400' },

  bioInput: { height: 90, textAlignVertical: 'top' },
  charCount: { ...typography.caption, color: colors.textMuted, textAlign: 'right', marginTop: -12, marginBottom: 16 },

  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  genderOption: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  genderOptionActive: { borderColor: GREEN, backgroundColor: GREEN_LIGHT },
  genderOptionText: { ...typography.smallBold, color: colors.textSecondary },
  genderOptionTextActive: { color: GREEN_DARK },

  infoBox: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  infoText: { ...typography.small, color: GREEN_DARK },

  verifyCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  unavailableNotice: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  unavailableText: { ...typography.small, color: '#856404', textAlign: 'center' },
  verifyEmoji: { fontSize: 36, marginBottom: 8 },
  verifyTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  verifyDesc: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },

  skipBtn: { alignSelf: 'center', marginBottom: 16 },
  skipText: { ...typography.small, color: colors.textMuted, textDecorationLine: 'underline' },

  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#506C48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { ...typography.button, color: '#fff' },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginPrompt: { ...typography.body, color: colors.textSecondary },
  loginLink: { ...typography.bodyBold, color: GREEN },
});
