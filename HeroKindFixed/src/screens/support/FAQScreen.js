import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const FAQ_DATA = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'What is HeroKind?',
        a: 'HeroKind is a community platform where students and neighbours help each other with everyday micro-tasks — like lending a tool, sharing food, or offering a skill. Every act of kindness earns you XP and builds your reputation.',
      },
      {
        q: 'How do I post a Need or Supply?',
        a: 'Tap the ＋ button on the Map screen. Choose whether you\'re posting a Need (something you want help with) or a Supply (something you\'re offering). Fill in the details and your pin will appear on the map for nearby users.',
      },
      {
        q: 'Is HeroKind free to use?',
        a: 'Yes, HeroKind is completely free. No subscription, no hidden fees — just neighbours helping neighbours.',
      },
    ],
  },
  {
    section: 'Account & Profile',
    items: [
      {
        q: 'How do I verify my student email?',
        a: 'Go to Settings → Verification → Verify Student Email. Enter your university email address and follow the link sent to your inbox. Verified students receive a blue shield badge on their profile.',
      },
      {
        q: 'Can I change my username or avatar?',
        a: 'Yes. Go to Settings → Account → Edit Profile or Change Avatar to update your display name, photo, and bio at any time.',
      },
      {
        q: 'How is my level calculated?',
        a: 'Your level is based on total XP earned. You earn XP each time you complete a help exchange and receive a review. Your level and title are shown on your profile and next to your posts.',
      },
    ],
  },
  {
    section: 'Exchanges & Safety',
    items: [
      {
        q: 'What should I do if something goes wrong during an exchange?',
        a: 'If you have a dispute or feel unsafe, use Settings → Help & Support → Contact Support or the "Report a safety issue" option in Privacy & Safety. Our team reviews all reports within 24 hours.',
      },
      {
        q: 'How do I block or report another user?',
        a: 'Visit the user\'s profile and tap the three-dot menu, or go to Settings → Privacy & Safety → Blocked users to manage your block list.',
      },
      {
        q: 'Are my personal details shared with other users?',
        a: 'Only your display name, avatar, neighbourhood, and star rating are visible to others. Your exact location, email, and phone number are never shared.',
      },
    ],
  },
  {
    section: 'Mini-Games',
    items: [
      {
        q: 'What are the mini-games for?',
        a: 'The Games tab features fun neighbourhood-themed mini-games — Farmer and Fisher — designed as a relaxing break between exchanges. They\'re just for fun and don\'t affect your community XP.',
      },
      {
        q: 'Do I lose my progress in mini-games if I log out?',
        a: 'Your game progress is saved to your account. Crops, fish, rods, and baits are all stored so you can pick up right where you left off.',
      },
    ],
  },
];

export default function FAQScreen({ navigation }) {
  const [openKeys, setOpenKeys] = useState({});

  const toggle = (key) => setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Find quick answers to the most common questions about HeroKind.
        </Text>

        {FAQ_DATA.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => {
                const key = `${section.section}-${idx}`;
                const isOpen = !!openKeys[key];
                const isLast = idx === section.items.length - 1;
                return (
                  <View key={key} style={[styles.item, !isLast && styles.itemDivider]}>
                    <TouchableOpacity
                      style={styles.questionRow}
                      onPress={() => toggle(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.question}>{item.q}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                    {isOpen && <Text style={styles.answer}>{item.a}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Still have questions?{'  '}
            <Text style={styles.footerLink} onPress={() => navigation.replace('ContactSupport')}>
              Contact Support
            </Text>
          </Text>
        </View>
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

  intro: {
    ...typography.body, color: colors.textSecondary,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4,
  },

  section: { marginTop: 20 },
  sectionTitle: {
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 1,
  },

  item: { paddingHorizontal: 14, paddingVertical: 14 },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },

  questionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  question: { ...typography.bodyBold, color: colors.textPrimary, flex: 1 },
  answer: {
    ...typography.body, color: colors.textSecondary,
    marginTop: 10, lineHeight: 22,
  },

  footer: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 20 },
  footerText: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  footerLink: { color: colors.primary, fontWeight: '600' },
});
