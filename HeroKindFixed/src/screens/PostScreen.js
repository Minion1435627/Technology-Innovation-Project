import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
   ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { usePosts } from '../context/PostsContext';
import { usePrivacy } from '../context/PrivacyContext';
import { useAuth } from '../context/AuthContext';

const NEED_CATEGORIES = ['Borrow an item', 'Physical help', 'Food sharing', 'Study/skills', 'Custom'];
const SUPPLY_CATEGORIES = ['Lend an item', 'Physical help', 'Share food', 'Offer skills', 'Custom'];
const URGENCIES = ['Low', 'Medium', 'High', 'ASAP'];
const EXPIRY_OPTIONS = ['2 hours', '6 hours', '1 day', '3 days', '7 days'];

const EXPIRY_MS = {
  '2 hours':  2 * 60 * 60 * 1000,
  '6 hours':  6 * 60 * 60 * 1000,
  '1 day':   24 * 60 * 60 * 1000,
  '3 days':  3 * 24 * 60 * 60 * 1000,
  '7 days':  7 * 24 * 60 * 60 * 1000,
};
const URGENCY_COLOR = {
  Low: colors.urgencyLow,
  Medium: colors.urgencyMedium,
  High: colors.urgencyHigh,
  ASAP: colors.urgencyAsap,
};

export default function PostScreen({ navigation, route }) {
  const { addPost } = usePosts();
  const { locationSettings } = usePrivacy();
  const { profile } = useAuth();
  const currentUser = profile;
  const [gpsCoords, setGpsCoords] = useState(route.params?.userLocation ?? null);

  useEffect(() => {
    if (gpsCoords) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGpsCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);
  const [postType, setPostType] = useState('need'); // 'need' | 'supply'
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    urgency: 'Medium',
    expiry: '1 day',
    availability: '',
  });
  const [photos, setPhotos] = useState([]);

  const categories = postType === 'need' ? NEED_CATEGORIES : SUPPLY_CATEGORIES;
  const accentColor = postType === 'need' ? colors.need : colors.supply;
  const accentBg = postType === 'need' ? colors.needLight : colors.supplyLight;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const FALLBACK = { latitude: -37.8144, longitude: 144.9398 };

  const handlePublish = () => {
    if (!form.title.trim()) {
      Alert.alert('Missing title', 'Please add a title before publishing.');
      return;
    }
    if (!form.category) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }

    const coords = locationSettings.useLocationForMap ? (gpsCoords ?? FALLBACK) : FALLBACK;

    const newPost = {
      id: `post_${Date.now()}`,
      type: postType,
      latitude: coords.latitude,
      longitude: coords.longitude,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category === 'Custom' ? form.customCategory || 'Custom' : form.category,
      urgency: postType === 'need' ? form.urgency : undefined,
      availability: postType === 'supply' ? form.availability : undefined,
      user_id: currentUser?.id,
      poster: {
        id: currentUser?.id,
        name: currentUser?.name,
        level: currentUser?.level,
        gender: currentUser?.gender,
        stars: currentUser?.stars,
      },
      timePosted: 'just now',
      expiresAt: Date.now() + (EXPIRY_MS[form.expiry] ?? EXPIRY_MS['7 days']),
    };

    addPost(newPost);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[styles.publishBtn, { backgroundColor: accentColor }]}
            onPress={handlePublish}
          >
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Type selector */}
          <View style={styles.typeSelector}>
            {[
              { key: 'need',   label: 'I Need Help',    icon: 'help-circle',  color: colors.need,   bg: colors.needLight },
              { key: 'supply', label: 'I Want to Offer', icon: 'gift',         color: colors.supply, bg: colors.supplyLight },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeBtn,
                  postType === t.key && { backgroundColor: t.bg, borderColor: t.color },
                ]}
                onPress={() => setPostType(t.key)}
              >
                <Ionicons
                  name={t.icon}
                  size={18}
                  color={postType === t.key ? t.color : colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.typeBtnText, postType === t.key && { color: t.color }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need / offer? (max 80 chars)"
              placeholderTextColor={colors.textMuted}
              value={form.title}
              onChangeText={v => set('title', v)}
              maxLength={80}
            />
            <Text style={styles.charCount}>{form.title.length}/80</Text>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details — what exactly, any special requirements, preferred handover method…"
              placeholderTextColor={colors.textMuted}
              value={form.description}
              onChangeText={v => set('description', v)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
            <View style={styles.chipsWrap}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    form.category === cat && { backgroundColor: accentBg, borderColor: accentColor },
                  ]}
                  onPress={() => set('category', cat)}
                >
                  <Text style={[styles.chipText, form.category === cat && { color: accentColor }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {form.category === 'Custom' && (
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Describe your custom category"
                placeholderTextColor={colors.textMuted}
                value={form.customCategory}
                onChangeText={v => set('customCategory', v)}
              />
            )}
          </View>

          {/* Urgency (need only) */}
          {postType === 'need' && (
            <View style={styles.field}>
              <Text style={styles.label}>Urgency <Text style={styles.required}>*</Text></Text>
              <View style={styles.chipsWrap}>
                {URGENCIES.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.chip,
                      form.urgency === u && {
                        backgroundColor: URGENCY_COLOR[u] + '22',
                        borderColor: URGENCY_COLOR[u],
                      },
                    ]}
                    onPress={() => set('urgency', u)}
                  >
                    <Text style={[
                      styles.chipText,
                      form.urgency === u && { color: URGENCY_COLOR[u], fontWeight: '700' },
                    ]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Expiry (need) / Availability (supply) */}
          <View style={styles.field}>
            {postType === 'need' ? (
              <>
                <Text style={styles.label}>Post expires in</Text>
                <View style={styles.chipsWrap}>
                  {EXPIRY_OPTIONS.map(e => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.chip, form.expiry === e && styles.chipActive]}
                      onPress={() => set('expiry', e)}
                    >
                      <Text style={[styles.chipText, form.expiry === e && styles.chipTextActive]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Availability window</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Today 2–6 PM, This weekend only"
                  placeholderTextColor={colors.textMuted}
                  value={form.availability}
                  onChangeText={v => set('availability', v)}
                />
              </>
            )}
          </View>

          {/* Photos */}
          <View style={styles.field}>
            <Text style={styles.label}>Photos (optional, up to 3)</Text>
            <View style={styles.photoRow}>
              {photos.map((_, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Text style={styles.photoThumbText}>📷</Text>
                </View>
              ))}
              {photos.length < 3 && (
                <TouchableOpacity
                  style={styles.addPhotoBtn}
                  onPress={() => setPhotos(p => [...p, p.length])}
                >
                  <Text style={styles.addPhotoIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Add photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Preview */}
          <View style={[styles.previewBox, { borderColor: accentColor }]}>
            <Text style={styles.previewLabel}>Preview</Text>
            <Text style={styles.previewTitle}>{form.title || 'Your post title will appear here'}</Text>
            {form.category ? (
              <View style={[styles.previewChip, { backgroundColor: accentBg }]}>
                <Text style={[styles.previewChipText, { color: accentColor }]}>{form.category}</Text>
              </View>
            ) : null}
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
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: { ...typography.body, color: colors.textSecondary },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  publishBtn: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  publishText: { ...typography.smallBold, color: colors.textWhite },

  container: { padding: 20, gap: 20, paddingBottom: 40 },

  typeSelector: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  typeBtnText: { ...typography.bodyBold, color: colors.textSecondary },

  field: {},
  label: { ...typography.smallBold, color: colors.textSecondary, marginBottom: 8 },
  required: { color: colors.error },

  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { ...typography.caption, color: colors.textMuted, alignSelf: 'flex-end', marginTop: 4 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { ...typography.small, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },

  photoRow: { flexDirection: 'row', gap: 10 },
  photoThumb: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoThumbText: { fontSize: 28 },
  addPhotoBtn: {
    width: 80,
    height: 80,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoIcon: { fontSize: 22, color: colors.textMuted },
  addPhotoText: { ...typography.caption, color: colors.textMuted },

  previewBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 8,
  },
  previewLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  previewTitle: { ...typography.h4, color: colors.textPrimary },
  previewChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  previewChipText: { ...typography.small, fontWeight: '600' },
});
