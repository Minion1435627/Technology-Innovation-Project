import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const GUIDELINES = [
  {
    emoji: '🤝',
    title: 'Be kind and respectful',
    body: 'HeroKind is built on trust. Treat every neighbour the way you\'d want to be treated — with patience, warmth, and respect. Rude or dismissive behaviour won\'t be tolerated.',
  },
  {
    emoji: '✅',
    title: 'Be honest about what you need or offer',
    body: 'Post accurate descriptions. Don\'t misrepresent an item\'s condition, the effort required, or your availability. Honesty keeps the community working for everyone.',
  },
  {
    emoji: '⏰',
    title: 'Follow through on your commitments',
    body: 'If you agree to help or accept an offer, show up. If your plans change, let the other person know as early as possible. Repeated no-shows may result in account restrictions.',
  },
  {
    emoji: '🔒',
    title: 'Respect privacy',
    body: 'Never share another user\'s personal information — address, phone number, photos, or any details shared in a private chat. Location data you see on the map is approximate and should never be used to track someone.',
  },
  {
    emoji: '🚫',
    title: 'No commercial activity or spam',
    body: 'HeroKind is for genuine community exchanges, not advertising or sales. Do not post promotional content, solicit money, or spam users in chat.',
  },
  {
    emoji: '🛡️',
    title: 'Keep exchanges safe',
    body: 'Meet in public places for in-person exchanges when possible. Never enter a stranger\'s home alone. Trust your instincts — if something feels off, cancel and report it.',
  },
  {
    emoji: '❌',
    title: 'Prohibited content',
    body: 'Do not post anything illegal, discriminatory, sexually explicit, or harmful. This includes hate speech, harassment, threats, or content that endangers any person or animal.',
  },
  {
    emoji: '🐾',
    title: 'Animal welfare',
    body: 'Posts involving pets (walking, sitting, rehoming) must ensure the animal\'s wellbeing. Rehoming animals without proper screening is not permitted.',
  },
  {
    emoji: '⭐',
    title: 'Leave fair reviews',
    body: 'Reviews help the whole community. Be honest and constructive. Do not leave reviews to retaliate, bribe, or manipulate another user\'s rating.',
  },
  {
    emoji: '📣',
    title: 'Report problems',
    body: 'If you see content or behaviour that violates these guidelines, report it using the in-app report tools. Our team reviews every report and takes action within 24 hours.',
  },
];

const CONSEQUENCES = [
  'A warning and educational notice',
  'Temporary restriction of posting or messaging',
  'Suspension of your account',
  'Permanent ban for severe or repeated violations',
];

export default function CommunityGuidelinesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🌱</Text>
          <Text style={styles.heroTitle}>Our Community Values</Text>
          <Text style={styles.heroSub}>
            HeroKind works because neighbours trust each other. These guidelines help us keep that trust alive.
          </Text>
        </View>

        {/* Guidelines */}
        {GUIDELINES.map((g, idx) => (
          <View key={idx} style={styles.guidelineCard}>
            <View style={styles.guidelineIconWrap}>
              <Text style={styles.guidelineEmoji}>{g.emoji}</Text>
            </View>
            <View style={styles.guidelineText}>
              <Text style={styles.guidelineTitle}>{g.title}</Text>
              <Text style={styles.guidelineBody}>{g.body}</Text>
            </View>
          </View>
        ))}

        {/* Consequences */}
        <View style={styles.consequencesSection}>
          <Text style={styles.sectionHeader}>Enforcement</Text>
          <View style={styles.card}>
            <Text style={styles.consequencesIntro}>
              Violations of these guidelines may result in:
            </Text>
            {CONSEQUENCES.map((c, i) => (
              <View key={i} style={styles.consequenceRow}>
                <View style={styles.bullet} />
                <Text style={styles.consequenceText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last updated */}
        <Text style={styles.updatedText}>Last updated · April 2026</Text>
      </ScrollView>
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

  heroBanner: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 28, paddingHorizontal: 24,
    marginBottom: 8,
  },
  heroEmoji: { fontSize: 40, marginBottom: 10 },
  heroTitle: { ...typography.h3, color: colors.primaryDark, marginBottom: 8, textAlign: 'center' },
  heroSub: { ...typography.body, color: colors.primaryDark, textAlign: 'center', lineHeight: 22, opacity: 0.8 },

  guidelineCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: colors.card,
    marginHorizontal: 16, marginTop: 10,
    borderRadius: 14, padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 1,
  },
  guidelineIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  guidelineEmoji: { fontSize: 20 },
  guidelineText: { flex: 1 },
  guidelineTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  guidelineBody: { ...typography.small, color: colors.textSecondary, lineHeight: 20 },

  consequencesSection: { marginTop: 20 },
  sectionHeader: {
    ...typography.smallBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 20, paddingBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 1,
  },
  consequencesIntro: { ...typography.body, color: colors.textSecondary, marginBottom: 12 },
  consequenceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.primary,
  },
  consequenceText: { ...typography.body, color: colors.textPrimary, flex: 1 },

  updatedText: {
    ...typography.caption, color: colors.textMuted,
    textAlign: 'center', marginTop: 24,
  },
});
