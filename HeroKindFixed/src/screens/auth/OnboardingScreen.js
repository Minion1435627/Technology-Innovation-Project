import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
   ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const SLIDES = [
  {
    emoji: '🗺️',
    title: 'See who needs help nearby',
    body: 'Your neighbourhood map shows real-time requests and offers within walking distance.',
  },
  {
    emoji: '🤝',
    title: 'Ask, offer, and connect',
    body: 'Post a need or share what you have. Chat with neighbours in seconds.',
  },
  {
    emoji: '🏆',
    title: 'Earn rewards for helping',
    body: 'Build your reputation, level up your avatar, and climb the weekly leaderboard.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [slide, setSlide] = useState(0);
  const [avatarSelected, setAvatarSelected] = useState(false);

  const isLast = slide === SLIDES.length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {!isLast ? (
          <>
            {/* Slide indicator */}
            <View style={styles.dots}>
              {SLIDES.map((_, i) => (
                <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
              ))}
            </View>

            {/* Slide content */}
            <View style={styles.slideCard}>
              <Text style={styles.slideEmoji}>{SLIDES[slide].emoji}</Text>
              <Text style={styles.slideTitle}>{SLIDES[slide].title}</Text>
              <Text style={styles.slideBody}>{SLIDES[slide].body}</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setSlide(s => s + 1)}>
              <Text style={styles.primaryBtnText}>
                {slide === SLIDES.length - 1 ? 'Create your avatar →' : 'Next →'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSlide(SLIDES.length)}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Avatar creation */}
            <Text style={styles.avatarTitle}>Create your 3D avatar</Text>
            <Text style={styles.avatarSub}>
              Upload any image — a selfie, illustration, or cartoon character. We'll generate your unique 3D avatar using AI.
            </Text>

            <TouchableOpacity
              style={[styles.avatarUploadBox, avatarSelected && styles.avatarUploadBoxSelected]}
              onPress={() => setAvatarSelected(true)}
            >
              {avatarSelected ? (
                <>
                  <Text style={styles.avatarPreviewEmoji}>🧑‍💻</Text>
                  <Text style={styles.avatarPreviewText}>Avatar selected!</Text>
                  <Text style={styles.avatarPreviewSub}>AI is processing your 3D model…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Tap to upload a photo</Text>
                  <Text style={styles.uploadSub}>Selfie, illustration, pet photo — anything works</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Preview avatars */}
            <View style={styles.examplesRow}>
              {['🧑', '👩', '🧙', '🐱', '🎭'].map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.exampleAvatar}
                  onPress={() => setAvatarSelected(true)}
                >
                  <Text style={styles.exampleEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.examplesLabel}>Or pick a quick example above</Text>

            <View style={styles.guidelinesBox}>
              <Text style={styles.guidelinesTitle}>Community guidelines</Text>
              <Text style={styles.guidelinesText}>
                • Be respectful and kind to all neighbours{'\n'}
                • Only post genuine needs and offers{'\n'}
                • Return borrowed items on time{'\n'}
                • No spam, no harassment, no fake listings
              </Text>
              <TouchableOpacity style={styles.agreeBtn} onPress={() => navigation.replace('Main')}>
                <Text style={styles.agreeBtnText}>I agree — Let me in! 🎉</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 24, alignItems: 'center' },

  dots: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.primary },

  slideCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  slideEmoji: { fontSize: 72, marginBottom: 24 },
  slideTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  slideBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  primaryBtnText: { ...typography.button, color: colors.textWhite },
  skipText: { ...typography.small, color: colors.textMuted, marginTop: 8 },

  // Avatar
  avatarTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: 8, alignSelf: 'flex-start' },
  avatarSub: { ...typography.body, color: colors.textSecondary, marginBottom: 24, lineHeight: 22 },

  avatarUploadBox: {
    width: '100%',
    height: 180,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  avatarUploadBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  uploadIcon: { fontSize: 40 },
  uploadText: { ...typography.bodyBold, color: colors.textPrimary },
  uploadSub: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  avatarPreviewEmoji: { fontSize: 60 },
  avatarPreviewText: { ...typography.h4, color: colors.primary },
  avatarPreviewSub: { ...typography.small, color: colors.textSecondary },

  examplesRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  exampleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  exampleEmoji: { fontSize: 28 },
  examplesLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 24 },

  guidelinesBox: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginTop: 8,
  },
  guidelinesTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 12 },
  guidelinesText: { ...typography.body, color: colors.textSecondary, lineHeight: 26 },
  agreeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  agreeBtnText: { ...typography.button, color: colors.textWhite },
});
