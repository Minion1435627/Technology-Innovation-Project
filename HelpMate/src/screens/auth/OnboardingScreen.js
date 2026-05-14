import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { generateAvatarFromImage } from '../../services/tripoApi';
import AvatarCropEditor from '../../components/AvatarCropEditor';
import { useAuth } from '../../context/AuthContext';
import { copyRemoteAvatarImageToStorage, copyRemoteAvatarToStorage } from '../../lib/db';

// Match CoverScreen palette
const GREEN       = '#86A778';
const GREEN_DARK  = '#41503C';
const PAPER       = '#F4F0EA';
const GREEN_LIGHT = '#E4EFD8';

const SLIDES = [
  {
    color: '#C8DFC0',
    title: 'See who needs help nearby',
    body: 'Your neighbourhood map shows real-time requests and offers within walking distance.',
  },
  {
    color: '#C4D9E0',
    title: 'Ask, offer, and connect',
    body: 'Post a need or share what you have. Chat with neighbours in seconds.',
  },
  {
    color: '#DDD4C0',
    title: 'Earn rewards for helping',
    body: 'Build your reputation, level up your avatar, and climb the weekly leaderboard.',
  },
];

function SlideIllustration({ index }) {
  if (index === 0) {
    return (
      <View style={ill.scene}>
        <View style={ill.radiusRing} />
        <View style={ill.centerPin}>
          <View style={ill.centerPinInner} />
        </View>
        <View style={[ill.neighborPin, { position: 'absolute', top: '14%', left: '14%' }]} />
        <View style={[ill.neighborPin, { position: 'absolute', top: '18%', right: '16%' }]} />
        <View style={[ill.neighborPin, { position: 'absolute', bottom: '16%', left: '28%' }]} />
        <View style={[ill.neighborPin, { position: 'absolute', bottom: '20%', right: '14%' }]} />
      </View>
    );
  }

  if (index === 1) {
    return (
      <View style={ill.scene}>
        <View style={ill.chatLeft}>
          <View style={ill.chatLineW} />
          <View style={[ill.chatLineW, { width: '55%' }]} />
        </View>
        <View style={ill.chatRight}>
          <View style={ill.chatLineD} />
          <View style={[ill.chatLineD, { width: '60%' }]} />
        </View>
        <View style={[ill.chatLeft, { marginTop: -4 }]}>
          <View style={[ill.chatLineW, { width: '45%' }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={ill.scene}>
      <View style={ill.medal}>
        <Text style={ill.medalStar}>★</Text>
      </View>
      <View style={ill.xpBarBg}>
        <View style={ill.xpBarFill} />
      </View>
      <View style={ill.xpRow}>
        <Text style={ill.xpLabel}>Lv 3</Text>
        <Text style={ill.xpLabel}>+50 XP</Text>
        <Text style={ill.xpLabel}>Lv 4</Text>
      </View>
    </View>
  );
}

const ill = StyleSheet.create({
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  radiusRing: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 1.5, borderColor: 'rgba(65,80,60,0.25)',
    borderStyle: 'dashed',
  },
  centerPin: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#41503C',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 6, elevation: 4,
  },
  centerPinInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  neighborPin: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#86A778',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },

  chatLeft: {
    alignSelf: 'flex-start', marginLeft: 20,
    backgroundColor: '#41503C',
    borderRadius: 16, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 6, marginVertical: 4, maxWidth: '62%',
  },
  chatRight: {
    alignSelf: 'flex-end', marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 16, borderBottomRightRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 6, marginVertical: 4, maxWidth: '62%',
    borderWidth: 1.5, borderColor: 'rgba(65,80,60,0.15)',
  },
  chatLineW: { height: 3, width: '80%', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.65)' },
  chatLineD: { height: 3, width: '80%', borderRadius: 2, backgroundColor: 'rgba(65,80,60,0.25)' },

  medal: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#41503C',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
    marginBottom: 16,
  },
  medalStar: { fontSize: 34, color: '#F5C518' },
  xpBarBg: {
    width: '68%', height: 10, borderRadius: 5,
    backgroundColor: 'rgba(65,80,60,0.15)',
    marginBottom: 6,
  },
  xpBarFill: { width: '72%', height: '100%', borderRadius: 5, backgroundColor: '#41503C' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '68%' },
  xpLabel: { fontSize: 11, color: '#41503C', fontWeight: '600' },
});

// Generation states
const STATE = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
};

export default function OnboardingScreen({ navigation }) {
  const { user: authUser, patchProfile } = useAuth();
  const [slide, setSlide] = useState(0);
  const [imageUri, setImageUri] = useState(null);
  const [genState, setGenState] = useState(STATE.IDLE);
  const [progress, setProgress] = useState(0);
  const [avatarResult, setAvatarResult] = useState(null); // { modelUrl, renderedImageUrl }
  const [errorMsg, setErrorMsg] = useState('');
  const [genLabel, setGenLabel] = useState('');
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
    setGenLabel('');

    try {
      const result = await generateAvatarFromImage(imageUri, (pct, status, phase) => {
        setProgress(pct);
        if (status === 'running' || status === 'queued') setGenState(STATE.GENERATING);
        setGenLabel(phase === 'texturing' ? 'Adding colour…' : 'Generating 3D model…');
      });

      console.log('[Onboarding] generation result:', JSON.stringify(result, null, 2));

      setAvatarResult(result);
      setGenState(STATE.DONE);

      // Save avatar URLs to the user's profile in Supabase
      if (authUser?.id) {
        let storedBase = null;
        let storedTexture = null;
        let storedImage = null;
        try {
          storedBase = await copyRemoteAvatarToStorage(authUser.id, result.baseModelUrl ?? result.modelUrl, `avatar-base-${Date.now()}.glb`);
          if (result.textureModelUrl) {
            storedTexture = await copyRemoteAvatarToStorage(authUser.id, result.textureModelUrl, `avatar-texture-${Date.now()}.glb`);
          }
          if (result.renderedImageUrl) {
            storedImage = await copyRemoteAvatarImageToStorage(authUser.id, result.renderedImageUrl, `avatar-preview-${Date.now()}.png`);
          }
        } catch (storageErr) {
          console.warn('[Onboarding] avatar storage fallback:', storageErr?.message ?? String(storageErr));
        }
        console.log('[Onboarding] saving to Supabase — avatar_url:', storedBase?.publicUrl ?? result.modelUrl, 'avatar_image_url:', storedImage?.publicUrl ?? result.renderedImageUrl);
        await patchProfile({
          avatar_url: storedBase?.publicUrl ?? result.baseModelUrl ?? result.modelUrl,
          avatar_storage_path: storedBase?.storagePath ?? null,
          avatar_texture_url: storedTexture?.publicUrl ?? result.textureModelUrl ?? null,
          avatar_animated_url: null,
          avatar_image_url: storedImage?.publicUrl ?? result.renderedImageUrl,
          avatar_task_id: result.taskId,
        });
        console.log('[Onboarding] saved profile urls:', JSON.stringify({
          avatar_url: storedBase?.publicUrl ?? result.baseModelUrl ?? result.modelUrl,
          avatar_storage_path: storedBase?.storagePath ?? null,
          avatar_texture_url: storedTexture?.publicUrl ?? result.textureModelUrl ?? null,
          avatar_image_url: storedImage?.publicUrl ?? result.renderedImageUrl,
        }, null, 2));
        console.log('[Onboarding] patchProfile done');
      } else {
        console.warn('[Onboarding] no authUser.id — skipping Supabase save');
      }
    } catch (err) {
      console.error('[Onboarding] generation/save error:', err);
      setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
      setGenState(STATE.ERROR);
    }
  }

  // ─── Derived UI helpers ──────────────────────────────────────────────────────

  const isProcessing = genState === STATE.UPLOADING || genState === STATE.GENERATING;
  const avatarSelected = imageUri !== null;

  function uploadBoxContent() {
    if (genState === STATE.DONE) {
      return (
        <>
          {avatarResult?.renderedImageUrl ? (
            <Image
              source={{ uri: avatarResult.renderedImageUrl }}
              style={styles.avatarPreviewImage}
            />
          ) : (
            <View style={styles.uploadIconWrap}>
              <Ionicons name="checkmark-circle" size={44} color={GREEN} />
            </View>
          )}
          <Text style={styles.avatarPreviewText}>3D avatar ready!</Text>
        </>
      );
    }
    if (genState === STATE.ERROR) {
      return (
        <>
          <View style={styles.uploadIconWrap}>
            <Ionicons name="warning-outline" size={44} color="#C0392B" />
          </View>
          <Text style={[styles.avatarPreviewText, { color: '#C0392B' }]}>Generation failed</Text>
          <Text style={[styles.uploadSub, { color: '#C0392B', textAlign: 'center', paddingHorizontal: 12 }]}>
            {errorMsg}
          </Text>
        </>
      );
    }
    if (isProcessing) {
      const label = genState === STATE.UPLOADING
        ? 'Uploading image…'
        : `${genLabel || 'Generating 3D model…'} ${progress}%`;
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
        <View style={styles.uploadIconWrap}>
          <Ionicons name="camera-outline" size={44} color={colors.textMuted} />
        </View>
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
              <View style={[styles.slideIllustrationArea, { backgroundColor: SLIDES[slide].color }]}>
                <SlideIllustration index={slide} />
              </View>
              <View style={styles.slideTextArea}>
                <Text style={styles.slideTitle}>{SLIDES[slide].title}</Text>
                <Text style={styles.slideBody}>{SLIDES[slide].body}</Text>
              </View>
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
              {[
                { icon: 'person', color: '#86A778' },
                { icon: 'person', color: '#7AA8B4' },
                { icon: 'person', color: '#B48A78' },
                { icon: 'person', color: '#9878B4' },
                { icon: 'person', color: '#B4A878' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.exampleAvatar, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}
                  onPress={pickImage}
                >
                  <Ionicons name={item.icon} size={26} color={item.color} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.examplesLabel}>Tap any to upload your photo</Text>

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
                <Text style={styles.agreeBtnText}>I agree — Let me in</Text>
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
    marginBottom: 32,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  slideIllustrationArea: {
    width: '100%',
    height: 180,
  },
  slideTextArea: {
    padding: 28,
    alignItems: 'center',
  },
  slideTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: 10 },
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
  uploadIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
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

  examplesRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  exampleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
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
