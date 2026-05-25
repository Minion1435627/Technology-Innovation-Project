import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const GAMES = [
  {
    key: 'Farmer',
    image: require('../../assets/FarmerCover.png'),
    label: 'Farmer',
    tagline: 'Grow & harvest crops',
    xp: '+20 XP',
    badge: '🌾',
    badgeColor: '#70C894',
    badgeBg: 'rgba(112,200,148,0.14)',
    border: colors.primary,
  },
  {
    key: 'Fisher',
    image: require('../../assets/FisherCover.png'),
    label: 'Fisher',
    tagline: 'Cast a line & catch fish',
    xp: '+20 XP',
    badge: '🎣',
    badgeColor: '#45aaf2',
    badgeBg: 'rgba(69,170,242,0.14)',
    border: '#45aaf2',
  },
];

export default function GamesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mini-Games</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="game-controller" size={18} color={colors.primaryDark} />
          <Text style={styles.bannerText}>Take a break. Have some fun!</Text>
        </View>

        {/* Cards */}
        {GAMES.map(game => (
          <View key={game.key} style={styles.shadowShell}>
            <TouchableOpacity
              style={[styles.card, { borderColor: game.border }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate(game.key)}
            >
              {/* Cover image */}
              <Image source={game.image} style={styles.cardImage} resizeMode="contain" />

              {/* Bottom strip */}
              <View style={styles.strip}>
                <View style={[styles.badgePill, { backgroundColor: game.badgeBg }]}>
                  <Text style={styles.badgeEmoji}>{game.badge}</Text>
                  <Text style={[styles.badgeLabel, { color: game.badgeColor }]}>{game.label}</Text>
                </View>

                <View style={styles.stripRight}>
                  <View style={[styles.playBtn, { backgroundColor: game.badgeColor }]}>
                    <Text style={styles.playBtnText}>Play</Text>
                    <Ionicons name="play" size={11} color="#fff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  headerSub: { ...typography.small, color: colors.textSecondary, marginTop: 3 },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff8e6',
    borderWidth: 1,
    borderColor: '#f5d98a',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  xpPillText: { fontSize: 12, fontWeight: '700', color: '#b07d10' },

  scroll: { padding: 20, gap: 22, paddingBottom: 32 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerText: { ...typography.small, color: colors.primaryDark, fontWeight: '600', flex: 1 },

  shadowShell: {
    borderRadius: 20,
    shadowColor: '#3a5c2e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    backgroundColor: colors.card,
  },
  card: {
    borderRadius: 20,
    borderWidth: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 220,
  },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeEmoji: { fontSize: 15 },
  badgeLabel: { fontSize: 14, fontWeight: '700' },

  stripRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff8e6',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  xpTagText: { fontSize: 11, fontWeight: '700', color: '#b07d10' },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  playBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
