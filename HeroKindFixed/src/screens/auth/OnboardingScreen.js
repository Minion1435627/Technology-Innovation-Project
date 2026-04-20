import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { generateAvatarFromImage } from '../../services/tripoApi';
import AvatarCropEditor from '../../components/AvatarCropEditor';

// Match CoverScreen palette
const GREEN       = '#86A778';
const GREEN_DARK  = '#41503C';
const PAPER       = '#F4F0EA';
const GREEN_LIGHT = '#E4EFD8';

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

// Generation states
const STATE = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
};

export default function OnboardingScreen({ navigation }) {
  const [slide, setSlide] = useState(0);
  const [imageUri, setImageUri] = useState(null);
  const [genState, setGenState] = useState(STATE.IDLE);
  const [progress, setProgress] = useState(0);
  const [avatarResult, setAvatarResult] = useState(null); // { modelUrl, renderedImageUrl }
  const [errorMsg, setErrorMsg] = useState('');
  // Crop editor state
  const [pendingImageUri, setPendingImageUri] = useState(null);
  const [cropVisible, setCropVisible]         = useState(false);

  const isLast = slide === SLIDES.length;

  // ─── Image picker ────────────────────────────────────────────────────────────

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1, // full quality — we compress in the crop step
    });

    if (!result.canceled && result.assets?.[0]) {
      setPendingImageUri(result.assets[0].uri);
      setCropVisible(true);
    }
  }

  function handleCropConfirm(croppedUri) {
    setCropVisible(false);
    setPendingImageUri(null);
    setImageUri(croppedUri);
    setGenState(STATE.IDLE);
    setAvatarResult(null);
    setErrorMsg('');
  }

  function handleCropCancel() {
    setCropVisible(false);
    setPendingImageUri(null);
  }

  // ─── Generate avatar ─────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!imageUri) {
      Alert.alert('No image selected', 'Please upload a photo first.');
      return;
    }

    setGenState(STATE.UPLOADING);
    setProgress(0);
    setErrorMsg('');

    try {
      const result = await generateAvatarFromImage(imageUri, (pct, status) => {
        setProgress(pct);
        if (status === 'running') setGenState(STATE.GENERATING);
      });
      setAvatarResult(result);
      setGenState(STATE.DONE);
    } catch (err) {
      setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
      setGenState(STATE.ERROR);
    }
  }

  // ─── Derived UI helpers ──────────────────────────────────────────────────────

  const isProcessing = genState === STATE.UPLOADING || genState === STATE.GENERATING;
  const avatarSelected = imageUri !== null;

  function uploadBoxContent() {
    if (genState === STATE.DONE && avatarResult?.renderedImageUrl) {
      return (
        <>
          <Image
            source={{ uri: avatarResult.renderedImageUrl }}
            style={styles.avatarPreviewImage}
          />
          <Text style={styles.avatarPreviewText}>3D avatar ready!</Text>
        </>
      );
    }
    if (isProcessing) {
      const label = genState === STATE.UPLOADING
        ? 'Uploading image…'
        : `Generating 3D model… ${progress}%`;
      return (
        <>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.avatarPreviewText}>{label}</Text>
        </>
      );
    }
    if (imageUri) {
      return (
        <>
          <Image source={{ uri: imageUri }} style={styles.avatarPreviewImage} />
          <Text style={styles.avatarPreviewText}>Image selected</Text>
          <Text style={styles.avatarPreviewSub}>Tap "Generate 3D Avatar" below</Text>
        </>
      );
    }
    return (
      <>
        <Text style={styles.uploadIcon}>📷</Text>
        <Text style={styles.uploadText}>Tap to upload a photo</Text>
        <Text style={styles.uploadSub}>Selfie, illustration, pet photo — anything works</Text>
      </>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

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

            {/* Upload box */}
            <TouchableOpacity
              style={[styles.avatarUploadBox, avatarSelected && styles.avatarUploadBoxSelected]}
              onPress={isProcessing ? undefined : pickImage}
              disabled={isProcessing}
            >
              {uploadBoxContent()}
            </TouchableOpacity>

            {/* Error message */}
            {genState === STATE.ERROR && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}

            {/* Generate button — shown after an image is picked, not yet done */}
            {imageUri && genState !== STATE.DONE && (
              <TouchableOpacity
                style={[styles.primaryBtn, isProcessing && styles.btnDisabled]}
                onPress={handleGenerate}
                disabled={isProcessing}
              >
                <Text style={styles.primaryBtnText}>
                  {isProcessing ? 'Processing…' : 'Generate 3D Avatar →'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Preview avatars */}
            <View style={styles.examplesRow}>
              {['🧑', '👩', '🧙', '🐱', '🎭'].map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.exampleAvatar}
                  onPress={pickImage}
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
              <TouchableOpacity
                style={styles.agreeBtn}
                onPress={() => navigation.replace('Main')}
              >
                <Text style={styles.agreeBtnText}>I agree — Let me in! 🎉</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <AvatarCropEditor
        visible={cropVisible}
        imageUri={pendingImageUri}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  container: { flexGrow: 1, padding: 24, alignItems: 'center' },

  dots: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8D4C0' },
  dotActive: { width: 24, backgroundColor: GREEN },

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
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#506C48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { ...typography.button, color: '#fff' },
  skipText: { ...typography.small, color: '#8A9A82', marginTop: 8 },

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
    overflow: 'hidden',
  },
  avatarUploadBoxSelected: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  uploadIcon: { fontSize: 40 },
  uploadText: { ...typography.bodyBold, color: colors.textPrimary },
  uploadSub: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  avatarPreviewImage: { width: 100, height: 100, borderRadius: 12 },
  avatarPreviewText: { ...typography.h4, color: GREEN_DARK },
  avatarPreviewSub: { ...typography.small, color: colors.textSecondary },

  errorText: {
    ...typography.small,
    color: '#C0392B',
    textAlign: 'center',
    marginBottom: 12,
  },

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
    backgroundColor: GREEN,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#506C48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  agreeBtnText: { ...typography.button, color: '#fff' },
});
